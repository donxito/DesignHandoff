import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  requireProjectAdmin,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";
import {
  ProjectInvitationRow,
  ProjectRow,
  ProfileRow,
} from "@/lib/types/supabase";

// Define a type that matches the select query output
interface ProjectInvitationWithRelations extends ProjectInvitationRow {
  invited_by_user: Pick<ProfileRow, "id" | "full_name"> | null;
  project: Pick<ProjectRow, "id" | "name" | "description"> | null;
}

/**
 * POST /api/projects/[id]/invitations/[invitationId]/resend
 * Resend a pending invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id: projectId, invitationId } = await params;

    // Verify authentication and project admin access
    const authContext = await requireProjectAdmin(request, projectId);

    // Get invitation details
    const { data: invitation, error: fetchError } = await supabase
      .from("project_invitations")
      .select(
        `
        *,
        invited_by_user:invited_by(id, full_name, email),
        project:project_id(id, name, description)
      `
      )
      .eq("id", invitationId)
      .eq("project_id", projectId)
      .single<ProjectInvitationWithRelations>();

    if (fetchError || !invitation) {
      return createErrorResponse("Invitation not found", 404);
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return createErrorResponse("Can only resend pending invitations", 400);
    }

    // Generate new token and extend expiration
    const { EmailService } = await import("@/lib/services/email");
    const newToken = EmailService.generateInvitationToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    // Update invitation with new token and expiration
    const { error: updateError } = await supabase
      .from("project_invitations")
      .update({
        invitation_token: newToken,
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return createErrorResponse("Failed to update invitation", 500);
    }

    // Send new invitation email
    const invitationUrl = EmailService.generateInvitationUrl(newToken);
    const emailResult = await EmailService.sendReminder(invitation.email, {
      inviterName:
        invitation.invited_by_user?.full_name || authContext.user.email,
      projectName: invitation.project?.name || "Untitled Project",
      role: invitation.role,
      invitationUrl,
      expiresAt: newExpiresAt.toISOString(),
    });

    if (!emailResult.success) {
      return createErrorResponse(
        `Failed to resend invitation: ${emailResult.error}`,
        500
      );
    }

    return createSuccessResponse({
      message: `Invitation resent to ${invitation.email}`,
    });
  } catch (error) {
    console.error(
      "Error in POST /api/projects/[id]/invitations/[invitationId]/resend:",
      error
    );

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}
