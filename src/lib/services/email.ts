import { supabase } from "@/lib/supabase/client";
import { InvitationEmailData } from "@/lib/types/team";

// * Email templates for invitations

export class EmailTemplates {
  static getInvitationTemplate(data: InvitationEmailData): string {
    const {
      inviterName,
      projectName,
      role,
      invitationUrl,
      message,
      expiresAt,
    } = data;

    const roleDescription = {
      owner: "full access to manage",
      admin: "administrative access to",
      member: "collaborate on",
      viewer: "view and comment on",
    }[role];

    const expirationDate = new Date(expiresAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Invitation - ${projectName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .title {
            color: #1e293b;
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 600;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin: 30px 0;
        }
        .invitation-details {
            background: #f8fafc;
            padding: 24px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #6b7280;
            text-align: right;
        }
        .role-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .role-admin { background: #fef3c7; color: #92400e; }
        .role-member { background: #d1fae5; color: #065f46; }
        .role-viewer { background: #e0e7ff; color: #3730a3; }
        .message {
            background: #fffbeb;
            border: 1px solid #fed7aa;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-style: italic;
        }
        .cta-button {
            display: inline-block;
            padding: 16px 32px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
            transition: background-color 0.2s;
        }
        .cta-button:hover {
            background: #2563eb;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .expiration-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            color: #991b1b;
        }
        @media (max-width: 480px) {
            body { padding: 10px; }
            .container { padding: 20px; }
            .title { font-size: 24px; }
            .detail-row { flex-direction: column; }
            .detail-value { text-align: left; margin-top: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">DesignHandoff</div>
            <h1 class="title">You're Invited!</h1>
            <p class="subtitle">Join the ${projectName} project</p>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p><strong>${inviterName}</strong> has invited you to ${roleDescription} the <strong>${projectName}</strong> project on DesignHandoff.</p>
            
            <div class="invitation-details">
                <div class="detail-row">
                    <span class="detail-label">Project:</span>
                    <span class="detail-value">${projectName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Invited by:</span>
                    <span class="detail-value">${inviterName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Your role:</span>
                    <span class="detail-value">
                        <span class="role-badge role-${role}">${role}</span>
                    </span>
                </div>
            </div>
            
            ${
              message
                ? `
            <div class="message">
                <strong>Personal message:</strong><br>
                "${message}"
            </div>
            `
                : ""
            }
            
            <div style="text-align: center;">
                <a href="${invitationUrl}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="expiration-notice">
                ⏰ <strong>This invitation expires on ${expirationDate}</strong>
            </div>
            
            <p>If you can't click the button above, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${invitationUrl}</p>
        </div>
        
        <div class="footer">
            <p>This invitation was sent by DesignHandoff on behalf of ${inviterName}.</p>
            <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  static getPlainTextTemplate(data: InvitationEmailData): string {
    const {
      inviterName,
      projectName,
      role,
      invitationUrl,
      message,
      expiresAt,
    } = data;

    const expirationDate = new Date(expiresAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
You're invited to join the ${projectName} project!

${inviterName} has invited you to collaborate on the "${projectName}" project on DesignHandoff as a ${role}.

${message ? `Personal message: "${message}"` : ""}

To accept this invitation, visit:
${invitationUrl}

This invitation expires on ${expirationDate}.

If you weren't expecting this invitation, you can safely ignore this email.

---
Sent by DesignHandoff on behalf of ${inviterName}
    `.trim();
  }
}

// * Email service for sending invitations

export class EmailService {
  private static readonly FROM_EMAIL = "noreply@designhandoff.com";
  private static readonly FROM_NAME = "DesignHandoff";

  /**
   * Send invitation email using Supabase Auth
   */
  static async sendInvitation(
    email: string,
    data: InvitationEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Use templates when implementing Resend
      // const htmlTemplate = EmailTemplates.getInvitationTemplate(data);
      // const textTemplate = EmailTemplates.getPlainTextTemplate(data);

      // Use Supabase's built-in email functionality
      // TODO: Use Resend
      const { error } = await supabase.auth.admin.generateLink({
        type: "invite",
        email: email,
        options: {
          data: {
            invitation_token: data.invitationUrl.split("/").pop(),
            project_name: data.projectName,
            inviter_name: data.inviterName,
            role: data.role,
            message: data.message || "",
          },
        },
      });

      if (error) {
        console.error("Error sending invitation email:", error);
        return {
          success: false,
          error: `Failed to send invitation: ${error.message}`,
        };
      }

      // TODO: Use Resend
      /*
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          from: {
            email: this.FROM_EMAIL,
            name: this.FROM_NAME,
          },
          subject: `Invitation to join ${data.projectName} on DesignHandoff`,
          html: htmlTemplate,
          text: textTemplate,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }
      */

      return { success: true };
    } catch (error) {
      console.error("Error in sendInvitation:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // * Send reminder email for pending invitation

  static async sendReminder(
    email: string,
    data: InvitationEmailData
  ): Promise<{ success: boolean; error?: string }> {
    // Modify the template for reminder
    const reminderData = {
      ...data,
      message: `Reminder: ${data.message || "You have a pending invitation to join this project."}`,
    };

    return this.sendInvitation(email, reminderData);
  }

  // * Generate invitation URL with token

  static generateInvitationUrl(token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/invitations/${token}`;
  }

  // * Generate secure invitation token

  static generateInvitationToken(): string {
    // Generate a cryptographically secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }
}

// * Utility to validate email addresses

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// * Utility to check if invitation is expired

export function isInvitationExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
