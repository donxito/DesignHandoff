import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ProjectMember,
  ProjectInvitation,
  InviteUserData,
  UpdateMemberRoleData,
  ProjectMembersResponse,
  AcceptInvitationData,
} from "@/lib/types/team";
import { Project } from "@/lib/types/project";

// API client functions
const api = {
  // Project members
  async getProjectMembers(projectId: string): Promise<ProjectMembersResponse> {
    const response = await fetch(`/api/projects/${projectId}/members`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch project members");
    }
    const result = await response.json();
    return result.data;
  },

  // Invitations
  async inviteUser(
    projectId: string,
    data: InviteUserData
  ): Promise<ProjectInvitation> {
    const response = await fetch(`/api/projects/${projectId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send invitation");
    }
    const result = await response.json();
    return result.data.invitation;
  },

  async cancelInvitation(
    projectId: string,
    invitationId: string
  ): Promise<void> {
    const response = await fetch(
      `/api/projects/${projectId}/invitations/${invitationId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cancel invitation");
    }
  },

  async resendInvitation(
    projectId: string,
    invitationId: string
  ): Promise<void> {
    const response = await fetch(
      `/api/projects/${projectId}/invitations/${invitationId}/resend`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to resend invitation");
    }
  },

  async getInvitationDetails(token: string): Promise<ProjectInvitation> {
    const response = await fetch(`/api/invitations/${token}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get invitation details");
    }
    const result = await response.json();
    return result.data;
  },

  async acceptInvitation(
    data: AcceptInvitationData
  ): Promise<{ member: ProjectMember; project: Project }> {
    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to accept invitation");
    }
    const result = await response.json();
    return result.data;
  },

  // Member management
  async updateMemberRole(
    projectId: string,
    userId: string,
    data: UpdateMemberRoleData
  ): Promise<ProjectMember> {
    const response = await fetch(
      `/api/projects/${projectId}/members/${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update member role");
    }
    const result = await response.json();
    return result.data.member;
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    const response = await fetch(
      `/api/projects/${projectId}/members/${userId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove member");
    }
  },

  async getMemberDetails(
    projectId: string,
    userId: string
  ): Promise<ProjectMember> {
    const response = await fetch(
      `/api/projects/${projectId}/members/${userId}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get member details");
    }
    const result = await response.json();
    return result.data.member;
  },
};

// Query keys
export const teamQueries = {
  all: ["team"] as const,
  members: (projectId: string) =>
    [...teamQueries.all, "members", projectId] as const,
  member: (projectId: string, userId: string) =>
    [...teamQueries.all, "member", projectId, userId] as const,
  invitation: (token: string) =>
    [...teamQueries.all, "invitation", token] as const,
};

// Hooks for project members
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: teamQueries.members(projectId),
    queryFn: () => api.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useMemberDetails(projectId: string, userId: string) {
  return useQuery({
    queryKey: teamQueries.member(projectId, userId),
    queryFn: () => api.getMemberDetails(projectId, userId),
    enabled: !!projectId && !!userId,
  });
}

// Hooks for invitations
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: InviteUserData;
    }) => api.inviteUser(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(projectId),
      });
      toast.success("Invitation sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      invitationId,
    }: {
      projectId: string;
      invitationId: string;
    }) => api.cancelInvitation(projectId, invitationId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(projectId),
      });
      toast.success("Invitation cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      invitationId,
    }: {
      projectId: string;
      invitationId: string;
    }) => api.resendInvitation(projectId, invitationId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(projectId),
      });
      toast.success("Invitation resent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useInvitationDetails(token: string) {
  return useQuery({
    queryKey: teamQueries.invitation(token),
    queryFn: () => api.getInvitationDetails(token),
    enabled: !!token,
    retry: false, // Don't retry on invalid tokens
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.acceptInvitation,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(data.project.id),
      });
      toast.success(`Successfully joined ${data.project.name}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hooks for member management
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      data,
    }: {
      projectId: string;
      userId: string;
      data: UpdateMemberRoleData;
    }) => api.updateMemberRole(projectId, userId, data),
    onSuccess: (_, { projectId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: teamQueries.member(projectId, userId),
      });
      toast.success("Member role updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => api.removeMember(projectId, userId),
    onSuccess: (_, { projectId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(projectId),
      });
      queryClient.removeQueries({
        queryKey: teamQueries.member(projectId, userId),
      });
      toast.success("Member removed from project");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Combined hook for team management (convenience hook)
export function useTeamManagement(projectId: string) {
  const members = useProjectMembers(projectId);
  const inviteUser = useInviteUser();
  const cancelInvitation = useCancelInvitation();
  const resendInvitation = useResendInvitation();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  return {
    // Data
    members: members.data?.members || [],
    invitations: members.data?.invitations || [],
    userRole: members.data?.user_role,
    isLoading: members.isLoading,
    error: members.error,

    // Actions
    inviteUser: inviteUser.mutate,
    cancelInvitation: cancelInvitation.mutate,
    resendInvitation: resendInvitation.mutate,
    updateMemberRole: updateMemberRole.mutate,
    removeMember: removeMember.mutate,

    // Loading states
    isInviting: inviteUser.isPending,
    isCancelling: cancelInvitation.isPending,
    isResending: resendInvitation.isPending,
    isUpdatingRole: updateMemberRole.isPending,
    isRemoving: removeMember.isPending,

    // Refetch function
    refetch: members.refetch,
  };
}
