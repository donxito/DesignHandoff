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

    // Get project members with user details (avoiding email from profiles since it doesn't exist)
    const { data: members, error: membersError } = await supabase
      .from("project_members")
      .select(
        `
        id,
        project_id,
        user_id, 
        role,
        joined_at,
        invited_by,
        user:user_id(id, full_name, avatar_url),
        invited_by_user:invited_by(id, full_name)
      `
      )
      .eq("project_id", projectId)
      .order("joined_at", { ascending: true });

    if (membersError) {
      console.error("Error fetching project members:", membersError);
      return createErrorResponse("Failed to fetch project members", 500);
    }

    // Get project owner info (also avoiding email)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(
        `
        owner_id,
        owner:owner_id(id, full_name, avatar_url)
      `
      )
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project owner:", projectError);
      return createErrorResponse("Failed to fetch project information", 500);
    }

    // Add owner to members list if not already included
    const ownerInMembers = members?.find(
      (m: any) => m.user_id === project.owner_id
    );
    const allMembers: any[] = [];

    if (!ownerInMembers && project.owner) {
      allMembers.push({
        id: `owner-${project.owner_id}`,
        project_id: projectId,
        user_id: project.owner_id,
        role: "owner",
        joined_at: null,
        invited_by: null,
        user: {
          id: project.owner.id,
          full_name: project.owner.full_name,
          avatar_url: project.owner.avatar_url,
          email: null, // Email not available from profiles table
        },
        invited_by_user: null,
      });
    }

    if (members) {
      // Add email as null for existing members since we can't get it from profiles
      const membersWithEmail = members.map((member: any) => ({
        ...member,
        user: member.user
          ? {
              ...member.user,
              email: null, // Email not available from profiles table
            }
          : null,
      }));
      allMembers.push(...membersWithEmail);
    }

    // Get pending invitations if user has admin access
    let invitations: any[] = [];

    if (
      authContext.projectRole &&
      ["owner", "admin"].includes(authContext.projectRole)
    ) {
      const { data: pendingInvitations } = await supabase
        .from("project_invitations")
        .select(
          `
          id,
          email,
          role,
          status,
          created_at,
          expires_at,
          invited_by,
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
