import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClient, handleApiResponse } from "@/lib/utils/api-client";
import { InviteUserData } from "@/lib/types/team";

// API Response interfaces
interface ApiSuccessResponse {
  message?: string;
  success?: boolean;
}

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

interface UpdateMemberRoleData {
  userId: string;
  role: "admin" | "member" | "viewer";
}

// Hook to fetch team members and invitations
export function useTeam(projectId: string) {
  return useQuery<TeamData>({
    queryKey: ["team", projectId],
    queryFn: async () => {
      const response = await ApiClient.get(
        `/api/projects/${projectId}/members`
      );
      return handleApiResponse<TeamData>(response);
    },
    enabled: !!projectId,
  });
}

// Hook to invite a user to the project
export function useInviteUser(projectId: string) {
  const queryClient = useQueryClient();

  const sendInvitation = useMutation({
    mutationFn: async (data: InviteUserData) => {
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-invitations", projectId],
      });
      toast.success("Invitation sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return sendInvitation;
}

// Hook to update member role
export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMemberRoleData) => {
      const response = await ApiClient.put(
        `/api/projects/${projectId}/members/${data.userId}`,
        { role: data.role }
      );
      return handleApiResponse<ApiSuccessResponse>(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.message || "Member role updated successfully!");
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
      const response = await ApiClient.delete(
        `/api/projects/${projectId}/members/${userId}`
      );
      return handleApiResponse<ApiSuccessResponse>(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.message || "Member removed successfully!");
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
      const response = await ApiClient.delete(
        `/api/projects/${projectId}/invitations/${invitationId}`
      );
      return handleApiResponse<ApiSuccessResponse>(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.message || "Invitation cancelled successfully!");
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
      const response = await ApiClient.post(
        `/api/projects/${projectId}/invitations/${invitationId}/resend`
      );
      return handleApiResponse<ApiSuccessResponse>(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      toast.success(data.message || "Invitation resent successfully!");
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
      const response = await ApiClient.post("/api/invitations/accept", {
        token,
      });
      return handleApiResponse<ApiSuccessResponse>(response);
    },
    onSuccess: (data) => {
      toast.success(data.message || "Invitation accepted successfully!");
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
      const response = await ApiClient.get(`/api/invitations/${token}`);
      return handleApiResponse(response);
    },
    enabled: !!token,
  });
}
