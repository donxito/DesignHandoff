import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import {
  requireProjectAccess,
  canModifyUser,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";
import { ProjectRole } from "@/lib/types/team";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"], {
    errorMap: () => ({ message: "Role must be admin, member, or viewer" }),
  }),
});

/**
 * PUT /api/projects/[id]/members/[userId]
 * Update member role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: projectId, userId } = await params;

    // Verify authentication and project access
    const authContext = await requireProjectAccess(
      request,
      projectId,
      "change_roles"
    );

    // Parse and validate request body
    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    // Check if user can modify the target user
    const modifyCheck = await canModifyUser(
      authContext.user.id,
      projectId,
      userId,
      "change_role"
    );

    if (!modifyCheck.allowed) {
      return createErrorResponse(
        modifyCheck.reason || "Cannot modify this user",
        403
      );
    }

    // Verify target user is actually a member
    const { data: existingMember, error: fetchError } = await supabase
      .from("project_members")
      .select(
        "id, role, user:profiles!project_members_user_id_fkey(full_name, email)"
      )
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingMember) {
      return createErrorResponse("User is not a member of this project", 404);
    }

    // Check if new role is different
    if (existingMember.role === role) {
      return createErrorResponse("User already has this role", 400);
    }

    // Update member role
    const { data: updatedMember, error: updateError } = await supabase
      .from("project_members")
      .update({ role: role as ProjectRole })
      .eq("id", existingMember.id)
      .select(
        `
        *,
        user:user_id(id, full_name, email, avatar_url),
        invited_by_user:invited_by(id, full_name, email)
      `
      )
      .single();

    if (updateError) {
      console.error("Error updating member role:", updateError);
      return createErrorResponse("Failed to update member role", 500);
    }

    return createSuccessResponse({
      member: updatedMember,
      message: `Member role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error in PUT /api/projects/[id]/members/[userId]:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse(
        `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
        400
      );
    }

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}

/**
 * DELETE /api/projects/[id]/members/[userId]
 * Remove member from project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: projectId, userId } = await params;

    // Verify authentication and project access
    const authContext = await requireProjectAccess(
      request,
      projectId,
      "remove_members"
    );

    // Check if user can modify the target user
    const modifyCheck = await canModifyUser(
      authContext.user.id,
      projectId,
      userId,
      "remove"
    );

    if (!modifyCheck.allowed) {
      return createErrorResponse(
        modifyCheck.reason || "Cannot remove this user",
        403
      );
    }

    // Verify target user is actually a member
    const { data: existingMember, error: fetchError } = await supabase
      .from("project_members")
      .select(
        `
        id, 
        role,
        user:profiles!project_members_user_id_fkey(full_name)
      `
      )
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingMember) {
      return createErrorResponse("User is not a member of this project", 404);
    }

    // Cannot remove project owner
    if (existingMember.role === "owner") {
      return createErrorResponse("Cannot remove project owner", 403);
    }

    // Remove member from project
    const { error: deleteError } = await supabase
      .from("project_members")
      .delete()
      .eq("id", existingMember.id);

    if (deleteError) {
      console.error("Error removing project member:", deleteError);
      return createErrorResponse("Failed to remove member", 500);
    }

    const memberName = existingMember.user?.full_name || "User";

    return createSuccessResponse({
      message: `${memberName} has been removed from the project`,
    });
  } catch (error) {
    console.error(
      "Error in DELETE /api/projects/[id]/members/[userId]:",
      error
    );

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}

/**
 * GET /api/projects/[id]/members/[userId]
 * Get specific member details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: projectId, userId } = await params;

    // Verify authentication and project access
    await requireProjectAccess(request, projectId, "view");

    // Get member details
    const { data: member, error: fetchError } = await supabase
      .from("project_members")
      .select(
        `
        *,
        user:user_id(id, full_name, email, avatar_url),
        invited_by_user:invited_by(id, full_name, email)
      `
      )
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !member) {
      // Check if this is the project owner
      const { data: project } = await supabase
        .from("projects")
        .select(
          `
          owner_id,
          owner:owner_id(id, full_name, email, avatar_url)
        `
        )
        .eq("id", projectId)
        .eq("owner_id", userId)
        .single();

      if (project) {
        return createSuccessResponse({
          member: {
            id: `owner-${project.owner_id}`,
            project_id: projectId,
            user_id: project.owner_id,
            role: "owner",
            joined_at: null,
            invited_by: null,
            user: project.owner,
            invited_by_user: null,
          },
        });
      }

      return createErrorResponse("Member not found", 404);
    }

    return createSuccessResponse({ member });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/members/[userId]:", error);

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}
