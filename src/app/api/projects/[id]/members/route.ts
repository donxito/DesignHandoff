import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  requireProjectAccess,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";

/**
 * GET /api/projects/[id]/members
 * Get all members of a project including pending invitations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Verify authentication and project access
    const authContext = await requireProjectAccess(request, projectId, "view");

    // Get project members with user details
    const { data: members, error: membersError } = await supabase
      .from("project_members")
      .select(
        `
        *,
        user:user_id(id, full_name, email, avatar_url),
        invited_by_user:invited_by(id, full_name, email)
      `
      )
      .eq("project_id", projectId)
      .order("joined_at", { ascending: true });

    if (membersError) {
      console.error("Error fetching project members:", membersError);
      return createErrorResponse("Failed to fetch project members", 500);
    }

    // Get project owner info
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(
        `
        owner_id,
        owner:owner_id(id, full_name, email, avatar_url)
      `
      )
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project owner:", projectError);
      return createErrorResponse("Failed to fetch project information", 500);
    }

    // Add owner to members list if not already included
    const ownerInMembers = members?.find((m) => m.user_id === project.owner_id);
    const allMembers = [];

    if (!ownerInMembers && project.owner) {
      allMembers.push({
        id: `owner-${project.owner_id}`,
        project_id: projectId,
        user_id: project.owner_id,
        role: "owner",
        joined_at: null, // Will be set to project creation date in real implementation
        invited_by: null,
        user: project.owner,
        invited_by_user: null,
      });
    }

    if (members) {
      allMembers.push(...members);
    }

    // Get pending invitations if user has admin access
    let invitations: Array<{
      id: string;
      email: string;
      role: string;
      status: string | null;
      created_at: string | null;
      expires_at: string;
      invited_by_user?: {
        id: string;
        full_name: string | null;
      } | null;
    }> = [];

    if (
      authContext.projectRole &&
      ["owner", "admin"].includes(authContext.projectRole)
    ) {
      const { data: pendingInvitations } = await supabase
        .from("project_invitations")
        .select(
          `
          *,
          invited_by_user:invited_by(id, full_name)
        `
        )
        .eq("project_id", projectId)
        .eq("status", "pending");

      invitations = pendingInvitations || [];
    }

    return createSuccessResponse({
      members: allMembers,
      invitations,
      total: allMembers.length,
      user_role: authContext.projectRole,
    });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/members:", error);

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}
