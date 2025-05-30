import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";
import { isInvitationExpired } from "@/lib/services/email";

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

/**
 * POST /api/invitations/accept
 * Accept a project invitation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authContext = await requireAuth(request);

    // Parse and validate request body
    const body = await request.json();
    const { token } = acceptInvitationSchema.parse(body);

    // Find invitation by token
    const { data: invitation, error: fetchError } = await supabase
      .from("project_invitations")
      .select(
        `
        *,
        project:projects!project_invitations_project_id_fkey(id, name, description),
        invited_by_user:profiles!project_invitations_invited_by_fkey(id, full_name)
      `
      )
      .eq("invitation_token", token)
      .single();

    if (fetchError || !invitation) {
      return createErrorResponse("Invalid or expired invitation token", 404);
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return createErrorResponse(
        "This invitation has already been processed",
        400
      );
    }

    // Check if invitation has expired
    if (isInvitationExpired(invitation.expires_at)) {
      // Mark invitation as expired
      await supabase
        .from("project_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return createErrorResponse("This invitation has expired", 410);
    }

    // Verify the invitation email matches the authenticated user's email
    if (authContext.user.email !== invitation.email) {
      return createErrorResponse(
        "This invitation was sent to a different email address",
        403
      );
    }

    // Check if user is already a member of the project
    const { data: existingMember } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", invitation.project_id)
      .eq("user_id", authContext.user.id)
      .single();

    if (existingMember) {
      // Update invitation status to accepted anyway
      await supabase
        .from("project_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      return createErrorResponse(
        "You are already a member of this project",
        400
      );
    }

    // Begin database transaction to add member and update invitation
    const { data: newMember, error: memberError } = await supabase
      .from("project_members")
      .insert({
        project_id: invitation.project_id,
        user_id: authContext.user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        user:user_id(id, full_name, email, avatar_url),
        invited_by_user:invited_by(id, full_name, email)
      `
      )
      .single();

    if (memberError) {
      console.error("Error adding project member:", memberError);
      return createErrorResponse("Failed to add you to the project", 500);
    }

    // Update invitation status to accepted
    const { error: updateError } = await supabase
      .from("project_invitations")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error updating invitation status:", updateError);
      // Don't fail the request since user was already added to project
    }

    return createSuccessResponse(
      {
        member: newMember,
        project: invitation.project,
        message: `Successfully joined ${invitation.project?.name}`,
      },
      201
    );
  } catch (error) {
    console.error("Error in POST /api/invitations/accept:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse(
        `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
        400
      );
    }

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 401);
    }

    return createErrorResponse("Internal server error", 500);
  }
}

/**
 * GET /api/invitations/[token]
 * Get invitation details by token (for preview before accepting)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return createErrorResponse("Invitation token is required", 400);
    }

    // Find invitation by token
    const { data: invitation, error: fetchError } = await supabase
      .from("project_invitations")
      .select(
        `
        id,
        email,
        role,
        status,
        expires_at,
        created_at,
        project:projects!project_invitations_project_id_fkey(id, name, description),
        invited_by_user:profiles!project_invitations_invited_by_fkey(id, full_name)
      `
      )
      .eq("invitation_token", token)
      .single();

    if (fetchError || !invitation) {
      return createErrorResponse("Invalid invitation token", 404);
    }

    // Check if invitation has expired
    const isExpired = isInvitationExpired(invitation.expires_at);

    if (isExpired && invitation.status === "pending") {
      // Mark as expired
      await supabase
        .from("project_invitations")
        .update({ status: "expired" })
        .eq("invitation_token", token);

      invitation.status = "expired";
    }

    // Don't include sensitive data in response
    const safeInvitation = {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      project: invitation.project,
      invited_by_user: invitation.invited_by_user
        ? {
            full_name: invitation.invited_by_user.full_name,
          }
        : null,
      is_expired: isExpired,
    };

    return createSuccessResponse(safeInvitation);
  } catch (error) {
    console.error("Error in GET /api/invitations/[token]:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
