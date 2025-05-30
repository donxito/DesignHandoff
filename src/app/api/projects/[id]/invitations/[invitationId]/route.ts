import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  requireProjectAdmin,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";
import { ProjectInvitationRow } from "@/lib/types/supabase"; // Import necessary types

/**
 * DELETE /api/projects/[id]/invitations/[invitationId]
 * Cancel a pending invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id: projectId, invitationId } = await params;

    // Verify authentication and project admin access
    await requireProjectAdmin(request, projectId);

    // Verify invitation exists and belongs to this project
    const { data: invitation, error: fetchError } = await supabase
      .from("project_invitations")
      .select("id, project_id, status, email")
      .eq("id", invitationId)
      .eq("project_id", projectId)
      .single<ProjectInvitationRow>(); // Use the base type here as we don't need relations for delete

    if (fetchError || !invitation) {
      return createErrorResponse("Invitation not found", 404);
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return createErrorResponse("Can only cancel pending invitations", 400);
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from("project_invitations")
      .delete()
      .eq("id", invitationId);

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError);
      return createErrorResponse("Failed to cancel invitation", 500);
    }

    return createSuccessResponse({
      message: `Invitation to ${invitation.email} has been cancelled`,
    });
  } catch (error) {
    console.error(
      "Error in DELETE /api/projects/[id]/invitations/[invitationId]:",
      error
    );

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}
