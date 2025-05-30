"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Loader2, Mail, Calendar, User, Building } from "lucide-react";
import {
  useInvitationDetails,
  useAcceptInvitation,
} from "@/hooks/useTeamCollaboration";
import { useAuthStore } from "@/lib/store/authStore";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/types/team";
import Link from "next/link";

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { user } = useAuthStore();
  const [isAccepting, setIsAccepting] = useState(false);

  const { data: invitation, isLoading, error } = useInvitationDetails(token);

  const acceptInvitationMutation = useAcceptInvitation();

  useEffect(() => {
    if (acceptInvitationMutation.isSuccess) {
      const projectId = acceptInvitationMutation.data?.project?.id;
      if (projectId) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push("/dashboard");
      }
    }
  }, [
    acceptInvitationMutation.isSuccess,
    acceptInvitationMutation.data?.project?.id,
    router,
  ]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    setIsAccepting(true);
    try {
      await acceptInvitationMutation.mutateAsync({ token });
    } finally {
      setIsAccepting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading invitation...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message ||
                "The invitation you&apos;re looking for doesn&apos;t exist or is no longer valid."}
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired invitation
  if (invitation.status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-600">Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired and can no longer be accepted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Invitation to join <strong>{invitation.project?.name}</strong>{" "}
                expired on{" "}
                {new Date(invitation.expires_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please contact the project owner to request a new invitation.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already processed invitation
  if (invitation.status !== "pending") {
    let statusMessage: string;
    switch (invitation.status) {
      case "accepted":
        statusMessage = "This invitation has already been accepted.";
        break;
      case "declined":
        statusMessage = "This invitation was declined.";
        break;
      default:
        statusMessage = "Invitation status unknown.";
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invitation Already Processed</CardTitle>
            <CardDescription>{statusMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                You&apos;ve been invited to join{" "}
                <strong>{invitation.project?.name}</strong> as a{" "}
                <Badge variant="outline" className="ml-1">
                  {ROLE_LABELS[invitation.role]}
                </Badge>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link
                  href={`/auth/signin?redirectTo=${encodeURIComponent(`/invitations/${token}`)}`}
                >
                  Sign In to Accept
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href={`/auth/signup?redirectTo=${encodeURIComponent(`/invitations/${token}`)}`}
                >
                  Create Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email mismatch
  if (user.email !== invitation.email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-600">Email Mismatch</CardTitle>
            <CardDescription>
              This invitation was sent to a different email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Invitation sent to: <strong>{invitation.email}</strong>
                <br />
                Your current email: <strong>{user.email}</strong>
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in with the email address that received the
              invitation, or contact the project owner.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign In with Different Email</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main invitation acceptance interface
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
          <CardDescription>
            Join the {invitation.project?.name} project
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Project Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">
                  {invitation.project?.name}
                </h3>
                {invitation.project?.description && (
                  <p className="text-sm text-blue-700 mt-1">
                    {invitation.project.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invitation Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Invited by{" "}
                <strong>
                  {invitation.invited_by_user?.full_name || "Project Admin"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Your role:{" "}
                <Badge variant="outline">{ROLE_LABELS[invitation.role]}</Badge>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Expires on{" "}
                {new Date(invitation.expires_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">
              As a {ROLE_LABELS[invitation.role]}, you will be able to:
            </h4>
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS[invitation.role]}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAcceptInvitation}
              disabled={isAccepting || acceptInvitationMutation.isPending}
              className="w-full"
            >
              {(isAccepting || acceptInvitationMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Accept Invitation
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">Maybe Later</Link>
            </Button>
          </div>

          {/* Error Display */}
          {acceptInvitationMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                {acceptInvitationMutation.error.message}
              </p>
            </div>
          )}

          {/* Signup Prompt */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account? We&apos;ll create one for you when you
              accept this invitation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
