import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for team management
interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string | null;
  invited_by: string | null;
  user?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  invited_by_user?: {
    id: string;
    full_name: string | null;
  } | null;
}

interface ProjectInvitation {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
  expires_at: string;
  invited_by_user?: {
    id: string;
    full_name: string | null;
  } | null;
}

interface TeamData {
  members: TeamMember[];
  invitations: ProjectInvitation[];
  total: number;
  user_role: string;
}

interface InviteUserData {
  email: string;
  role: "admin" | "member" | "viewer";
  message?: string;
}

interface UpdateMemberRoleData {
  userId: string;
  role: "admin" | "member" | "viewer";
}

// Hook to fetch team members and invitations
export function useTeam(projectId: string) {
  return useQuery<TeamData>({
    queryKey: ["team", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch team data");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!projectId,
  });
}

// Hook to invite a user to the project
export function useInviteUser(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteUserData) => {
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.data.message || "Invitation sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to update member role
export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMemberRoleData) => {
      const response = await fetch(
        `/api/projects/${projectId}/members/${data.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: data.role }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update member role");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.data.message || "Member role updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to remove member from project
export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
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

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.data.message || "Member removed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to cancel invitation
export function useCancelInvitation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
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

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.data.message || "Invitation cancelled successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to resend invitation
export function useResendInvitation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
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

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.data.message || "Invitation resent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to accept invitation (for invitation page)
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept invitation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.data.message || "Invitation accepted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to get invitation details by token
export function useInvitationDetails(token: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const response = await fetch(`/api/invitations/${token}`);
      if (!response.ok) {
        throw new Error("Invalid or expired invitation");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!token,
  });
}
