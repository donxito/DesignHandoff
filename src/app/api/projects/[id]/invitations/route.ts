import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import {
  requireProjectAdmin,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/permissions";
import { EmailService } from "@/lib/services/email";
import { ProjectRole } from "@/lib/types/team";

// Validation schema for invitation requests
const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"], {
    errorMap: () => ({ message: "Role must be admin, member, or viewer" }),
  }),
  message: z.string().optional(),
});

/**
 * POST /api/projects/[id]/invitations
 * Send invitation to join project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Verify authentication and project admin access
    const authContext = await requireProjectAdmin(request, projectId);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = inviteUserSchema.parse(body);
    const { email, role, message } = validatedData;

    // Check if user is already a project member
    const { data: existingMember } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", email) // This would need to be user ID, let's check by email in profiles
      .single();

    // Check if user exists and get their ID
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (existingUser && existingMember) {
      return createErrorResponse(
        "User is already a member of this project",
        400
      );
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from("project_invitations")
      .select("id, status")
      .eq("project_id", projectId)
      .eq("email", email)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return createErrorResponse("User already has a pending invitation", 400);
    }

    // Generate invitation token and expiration (7 days from now)
    const invitationToken = EmailService.generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from("project_invitations")
      .insert({
        project_id: projectId,
        email: email,
        role: role as ProjectRole,
        invited_by: authContext.user.id,
        invitation_token: invitationToken,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select(
        `
        *,
        invited_by_user:invited_by(id, full_name, email),
        project:project_id(id, name, description)
      `
      )
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return createErrorResponse("Failed to create invitation", 500);
    }

    // Get inviter information
    const { data: inviter } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", authContext.user.id)
      .single();

    // Get project information
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    // Send invitation email
    const invitationUrl = EmailService.generateInvitationUrl(invitationToken);
    const emailResult = await EmailService.sendInvitation(email, {
      inviterName: inviter?.full_name || authContext.user.email,
      projectName: project?.name || "Untitled Project",
      role: role as ProjectRole,
      invitationUrl,
      message,
      expiresAt: expiresAt.toISOString(),
    });

    if (!emailResult.success) {
      // Delete the invitation if email failed
      await supabase
        .from("project_invitations")
        .delete()
        .eq("id", invitation.id);

      return createErrorResponse(
        `Failed to send invitation email: ${emailResult.error}`,
        500
      );
    }

    return createSuccessResponse(
      {
        invitation,
        message: `Invitation sent to ${email}`,
      },
      201
    );
  } catch (error) {
    console.error("Error in POST /api/projects/[id]/invitations:", error);

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
 * GET /api/projects/[id]/invitations
 * Get all pending invitations for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Verify authentication and project admin access
    await requireProjectAdmin(request, projectId);

    // Get pending invitations
    const { data: invitations, error } = await supabase
      .from("project_invitations")
      .select(
        `
        *,
        invited_by_user:invited_by(id, full_name, email)
      `
      )
      .eq("project_id", projectId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
      return createErrorResponse("Failed to fetch invitations", 500);
    }

    return createSuccessResponse({
      invitations: invitations || [],
      total: invitations?.length || 0,
    });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/invitations:", error);

    if (error instanceof Error && error.message.includes("required")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse("Internal server error", 500);
  }
}
