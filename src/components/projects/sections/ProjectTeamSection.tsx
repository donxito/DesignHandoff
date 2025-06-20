"use client";

import { useState } from "react";
import { Project } from "@/lib/types/project";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Avatar } from "@/components/retroui/Avatar";
import { Badge } from "@/components/retroui/Badge";
import { Input } from "@/components/retroui/Input";
import { Textarea } from "@/components/retroui/Textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import {
  Users,
  Crown,
  UserPlus,
  Settings,
  Shield,
  Eye,
  UserCheck,
  UserX,
  Clock,
  Send,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  useTeam,
  useInviteUser,
  useUpdateMemberRole,
  useRemoveMember,
  useCancelInvitation,
  useResendInvitation,
} from "@/hooks/use-team";
import { TeamMemberListSkeleton } from "@/components/retroui/skeletons";

interface ProjectTeamSectionProps {
  project: Project;
}

export function ProjectTeamSection({ project }: ProjectTeamSectionProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">(
    "member"
  );
  const [inviteMessage, setInviteMessage] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Team data and mutations
  const { data: teamData, isLoading } = useTeam(project.id);
  const inviteUserMutation = useInviteUser(project.id);
  const updateRoleMutation = useUpdateMemberRole(project.id);
  const removeMemberMutation = useRemoveMember(project.id);
  const cancelInvitationMutation = useCancelInvitation(project.id);
  const resendInvitationMutation = useResendInvitation(project.id);

  const userRole = teamData?.user_role || "viewer";
  const canManageTeam = ["owner", "admin"].includes(userRole);
  const canChangeRoles = userRole === "owner";

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    await inviteUserMutation.mutateAsync({
      email: inviteEmail,
      role: inviteRole,
      message: inviteMessage || undefined,
    });

    // Reset form
    setInviteEmail("");
    setInviteMessage("");
    setShowInviteForm(false);
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: "admin" | "member" | "viewer"
  ) => {
    await updateRoleMutation.mutateAsync({
      userId,
      role: newRole,
    });
  };

  const handleRemoveMember = async (userId: string) => {
    await removeMemberMutation.mutateAsync(userId);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    await cancelInvitationMutation.mutateAsync(invitationId);
  };

  const handleResendInvitation = async (invitationId: string) => {
    await resendInvitationMutation.mutateAsync(invitationId);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "member":
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "warning" as const;
      case "admin":
        return "primary" as const;
      case "member":
        return "success" as const;
      case "viewer":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              Team Members
            </Text>
          </div>
          <TeamMemberListSkeleton count={3} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              Team Members
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="primary" size="sm">
              {teamData?.total || 0} member
              {(teamData?.total || 0) !== 1 ? "s" : ""}
            </Badge>
            {canManageTeam && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            )}
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && canManageTeam && (
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
            <Text
              as="h4"
              className="text-lg font-bold font-pixel text-black dark:text-white mb-4"
            >
              Invite Team Member
            </Text>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-pixel font-bold text-black dark:text-white mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-pixel font-bold text-black dark:text-white mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(
                        e.target.value as "admin" | "member" | "viewer"
                      )
                    }
                    className="w-full p-2 border-2 border-black rounded font-pixel"
                  >
                    <option value="viewer">
                      Viewer - Can view and comment
                    </option>
                    <option value="member">
                      Member - Can edit and collaborate
                    </option>
                    {canChangeRoles && (
                      <option value="admin">
                        Admin - Can manage team and settings
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-pixel font-bold text-black dark:text-white mb-2">
                  Personal Message (Optional)
                </label>
                <Textarea
                  placeholder="Add a personal message to the invitation..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim() || inviteUserMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {inviteUserMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Current Members */}
        <div className="space-y-4">
          <Text
            as="h4"
            className="text-lg font-bold font-pixel text-black dark:text-white"
          >
            Current Members
          </Text>

          <div className="space-y-3">
            {teamData?.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <Avatar variant="primary" className="w-10 h-10">
                    <Avatar.Image
                      src={member.user?.avatar_url || undefined}
                      alt={member.user?.full_name || "User"}
                    />
                    <Avatar.Fallback className="bg-pink-200 text-pink-800">
                      {(member.user?.full_name || member.user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <Text
                        as="span"
                        className="font-bold font-pixel text-black dark:text-white"
                      >
                        {member.user?.full_name ||
                          member.user?.email ||
                          "Unknown User"}
                      </Text>
                      {getRoleIcon(member.role)}
                    </div>
                    <Text
                      as="span"
                      className="text-sm text-gray-600 dark:text-gray-300"
                    >
                      {member.user?.email}
                    </Text>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                    {member.role}
                  </Badge>

                  {canManageTeam && member.role !== "owner" && (
                    <div className="flex gap-2">
                      {canChangeRoles && (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              member.user_id,
                              e.target.value as "admin" | "member" | "viewer"
                            )
                          }
                          disabled={updateRoleMutation.isPending}
                          className="p-1 border-2 border-black rounded text-sm font-pixel"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}

                      <Dialog>
                        <DialogTrigger className="flex items-center gap-1 px-4 py-1.5 text-sm bg-black text-white border-3 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all outline-none cursor-pointer">
                          <UserX className="h-3 w-3" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <Text
                              as="h3"
                              className="text-xl font-bold font-pixel text-black"
                            >
                              Remove Team Member
                            </Text>
                          </DialogHeader>
                          <div className="py-4">
                            <Text as="p" className="font-pixel text-black">
                              Are you sure you want to remove{" "}
                              {member.user?.full_name || member.user?.email}{" "}
                              from this project? This action cannot be undone.
                            </Text>
                          </div>
                          <DialogFooter>
                            <Button variant="secondary">Cancel</Button>
                            <Button
                              variant="solid"
                              onClick={() => handleRemoveMember(member.user_id)}
                            >
                              Remove Member
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {teamData?.invitations &&
          teamData.invitations.length > 0 &&
          canManageTeam && (
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <Text
                as="h4"
                className="text-lg font-bold font-pixel text-black dark:text-white mb-4"
              >
                Pending Invitations
              </Text>

              <div className="space-y-3">
                {teamData.invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <Text
                          as="span"
                          className="font-bold font-pixel text-yellow-800 dark:text-yellow-200"
                        >
                          {invitation.email}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={getRoleBadgeVariant(invitation.role)}
                            size="sm"
                          >
                            {invitation.role}
                          </Badge>
                          <Text
                            as="span"
                            className="text-sm text-yellow-700 dark:text-yellow-300"
                          >
                            Invited by{" "}
                            {invitation.invited_by_user?.full_name || "Unknown"}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResendInvitation(invitation.id)}
                        disabled={resendInvitationMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resend
                      </Button>

                      <Dialog>
                        <DialogTrigger className="flex items-center gap-1 px-4 py-1.5 text-sm bg-black text-white border-3 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all outline-none cursor-pointer">
                          <Trash2 className="h-3 w-3" />
                          Cancel
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <Text
                              as="h3"
                              className="text-xl font-bold font-pixel text-black"
                            >
                              Cancel Invitation
                            </Text>
                          </DialogHeader>
                          <div className="py-4">
                            <Text as="p" className="font-pixel text-black">
                              Are you sure you want to cancel the invitation for{" "}
                              {invitation.email}? They will no longer be able to
                              accept this invitation.
                            </Text>
                          </div>
                          <DialogFooter>
                            <Button variant="secondary">Keep Invitation</Button>
                            <Button
                              variant="solid"
                              onClick={() =>
                                handleCancelInvitation(invitation.id)
                              }
                            >
                              Cancel Invitation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </Card>

      {/* Team Settings */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-gray-500" />
          <Text
            as="h3"
            className="text-xl font-bold font-pixel text-black dark:text-white"
          >
            Team Settings
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
            <Text
              as="h4"
              className="font-bold font-pixel text-black dark:text-white mb-2"
            >
              Project Visibility
            </Text>
            <Text
              as="p"
              className="text-sm font-pixel text-gray-600 dark:text-gray-300"
            >
              Private - Only invited members can access
            </Text>
          </div>

          <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
            <Text
              as="h4"
              className="font-bold font-pixel text-black dark:text-white mb-2"
            >
              Your Role
            </Text>
            <div className="flex items-center gap-2">
              {getRoleIcon(userRole)}
              <Text
                as="p"
                className="text-sm font-pixel text-gray-600 dark:text-gray-300 capitalize"
              >
                {userRole}
              </Text>
            </div>
          </div>

          <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
            <Text
              as="h4"
              className="font-bold font-pixel text-black dark:text-white mb-2"
            >
              Invitations
            </Text>
            <Text
              as="p"
              className="text-sm font-pixel text-gray-600 dark:text-gray-300"
            >
              {teamData?.invitations?.length || 0} pending
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
