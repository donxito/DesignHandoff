import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase/client";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateInvitationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { email, role, message } = await req.json();

    // Basic validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!role || !["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be admin, member, or viewer." },
        { status: 400 }
      );
    }

    // Get project info
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    // Generate invitation token and expiration
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invitations/${token}`;

    // Send email
    const emailData = await resend.emails.send({
      from: "DesignHandoff <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation to join ${project.name} on DesignHandoff`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited to join ${project.name}!</h2>
          <p>You've been invited to collaborate on the <strong>${project.name}</strong> project as a <strong>${role}</strong>.</p>
          ${message ? `<p><em>Message: "${message}"</em></p>` : ""}
          <p><a href="${invitationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
          <p>This invitation expires in 7 days.</p>
          <p>If you can't click the button, copy this link: ${invitationUrl}</p>
        </div>
      `,
      text: `You've been invited to join the ${project.name} project as a ${role}. Accept your invitation: ${invitationUrl}`,
    });

    if (emailData.error) {
      console.error("Email error:", emailData.error);
      return NextResponse.json(
        { error: `Failed to send invitation: ${emailData.error.message}` },
        { status: 500 }
      );
    }

    // Store invitation in database (simplified)
    const { error: dbError } = await supabase
      .from("project_invitations")
      .insert({
        project_id: projectId,
        email: email,
        role: role,
        invitation_token: token,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        message: message,
        invited_by: "temp-user-id", // We'll fix this later with proper auth
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the request if email was sent successfully
      console.log("Email sent but database storage failed");
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Simplified GET endpoint
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const { data: invitations, error } = await supabase
      .from("project_invitations")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitations: invitations || [],
      total: invitations?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
