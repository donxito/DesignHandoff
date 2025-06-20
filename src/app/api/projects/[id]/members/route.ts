import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  requireProjectAccess,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";
import {
  ProjectMember,
  ProjectInvitation,
  ProjectMembersResponse,
} from "@/lib/types/team";

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

    // Use unknown to bypass complex Supabase typing issues, then safely transform
    const rawMembers = members as unknown as Array<{
      id: string;
      project_id: string;
      user_id: string;
      role: string;
      joined_at: string | null;
      invited_by: string | null;
      user: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;
      invited_by_user: {
        id: string;
        full_name: string | null;
      } | null;
    }>;

    const rawProject = project as unknown as {
      owner_id: string;
      owner: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;
    };

    // Add owner to members list if not already included
    const ownerInMembers = rawMembers?.find(
      (m) => m.user_id === rawProject.owner_id
    );
    const allMembers: ProjectMember[] = [];

    if (!ownerInMembers && rawProject.owner) {
      allMembers.push({
        id: `owner-${rawProject.owner_id}`,
        project_id: projectId,
        user_id: rawProject.owner_id,
        role: "owner",
        joined_at: null,
        invited_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: rawProject.owner.id,
          full_name: rawProject.owner.full_name,
          avatar_url: rawProject.owner.avatar_url,
          email: null, // Email not available from profiles table
        },
        invited_by_user: undefined,
      });
    }

    if (rawMembers) {
      // Add email as null for existing members since we can't get it from profiles
      const membersWithEmail: ProjectMember[] = rawMembers.map((member) => ({
        id: member.id,
        project_id: member.project_id,
        user_id: member.user_id,
        role: member.role as ProjectMember["role"],
        joined_at: member.joined_at,
        invited_by: member.invited_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: member.user
          ? {
              id: member.user.id,
              full_name: member.user.full_name,
              avatar_url: member.user.avatar_url,
              email: null, // Email not available from profiles table
            }
          : undefined,
        invited_by_user: member.invited_by_user
          ? {
              id: member.invited_by_user.id,
              full_name: member.invited_by_user.full_name,
              email: null,
            }
          : undefined,
      }));
      allMembers.push(...membersWithEmail);
    }

    // Get pending invitations if user has admin access
    let invitations: ProjectInvitation[] = [];

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

      invitations =
        (pendingInvitations as unknown as ProjectInvitation[]) || [];
    }

    const response: ProjectMembersResponse = {
      members: allMembers,
      invitations,
      total: allMembers.length,
      user_role: authContext.projectRole,
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/members:", error);

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}
