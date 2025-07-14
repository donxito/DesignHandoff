import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { commentsApi, CreateProjectCommentData } from "@/app/api/comments";
import { Comment, CreateCommentData } from "@/lib/types/comment";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// * Query key factory
const commentKeys = {
  all: ["comments"] as const,
  byDesignFile: (fileId: string) =>
    [...commentKeys.all, "file", fileId] as const,
  byProject: (projectId: string) =>
    [...commentKeys.all, "project", projectId] as const,
};

// * Hook for fetching comments for a design file
export function useComments(
  designFileId: string
): UseQueryResult<Comment[], Error> {
  return useQuery({
    queryKey: commentKeys.byDesignFile(designFileId), // query key
    queryFn: () => commentsApi.getComments(designFileId), // query function
    enabled: !!designFileId, // Only run if we have a file ID
  });
}

// * Hook for fetching project-level comments
export function useProjectComments(
  projectId: string
): UseQueryResult<Comment[], Error> {
  return useQuery({
    queryKey: commentKeys.byProject(projectId),
    queryFn: () => commentsApi.getProjectComments(projectId),
    enabled: !!projectId,
  });
}

// * Hook for creating a comment
export function useCreateComment(): UseMutationResult<
  Comment,
  Error,
  CreateCommentData
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData) => commentsApi.createComment(data),
    onSuccess: (newComment) => {
      // Early return if design_file_id is null
      if (!newComment.design_file_id) return;

      // Invalidate and refetch comments for this file
      queryClient.invalidateQueries({
        queryKey: commentKeys.byDesignFile(newComment.design_file_id),
      });

      // update the cache for immediate UI update
      queryClient.setQueryData(
        commentKeys.byDesignFile(newComment.design_file_id),
        (oldData: Comment[] | undefined) => {
          if (!oldData) return [newComment];

          // If this is a reply, update the parent comment
          if (newComment.parent_id) {
            return oldData.map((comment) => {
              if (comment.id === newComment.parent_id) {
                return {
                  ...comment,
                  replies: comment.replies
                    ? [...comment.replies, newComment]
                    : [newComment],
                };
              }
              return comment;
            });
          }

          // Otherwise, it's a top-level comment
          return [newComment, ...oldData];
        }
      );
    },
  });
}

// * Hook for creating project-level comments
export function useCreateProjectComment(): UseMutationResult<
  Comment,
  Error,
  CreateProjectCommentData
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectCommentData) =>
      commentsApi.createProjectComment(data),
    onSuccess: (newComment, variables) => {
      // Invalidate and refetch comments for this project
      queryClient.invalidateQueries({
        queryKey: commentKeys.byProject(variables.projectId),
      });

      // Update cache for immediate UI update
      queryClient.setQueryData(
        commentKeys.byProject(variables.projectId),
        (oldData: Comment[] | undefined) => {
          if (!oldData) return [newComment];

          // If this is a reply, update the parent comment
          if (newComment.parent_id) {
            return oldData.map((comment) => {
              if (comment.id === newComment.parent_id) {
                return {
                  ...comment,
                  replies: comment.replies
                    ? [...comment.replies, newComment]
                    : [newComment],
                };
              }
              return comment;
            });
          }

          // Otherwise, it's a top-level comment
          return [newComment, ...oldData];
        }
      );
    },
  });
}

// * Hook for deleting a comment
export function useDeleteComment(): UseMutationResult<
  void,
  Error,
  { id: string; designFileId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; designFileId: string }) =>
      commentsApi.deleteComment(id),
    onSuccess: (_, { id, designFileId }) => {
      // Invalidate and refetch comments for this file
      queryClient.invalidateQueries({
        queryKey: commentKeys.byDesignFile(designFileId),
      });

      // update the cache for immediate UI update
      queryClient.setQueryData(
        commentKeys.byDesignFile(designFileId),
        (oldData: Comment[] | undefined) => {
          if (!oldData) return [];

          // check if it's a top-level comment
          const filteredComments = oldData.filter(
            (comment) => comment.id !== id
          );

          // remove it from replies if it's a reply
          return filteredComments.map((comment) => {
            if (comment.replies?.some((reply) => reply.id === id)) {
              return {
                ...comment,
                replies: comment.replies.filter((reply) => reply.id !== id),
              };
            }
            return comment;
          });
        }
      );
    },
  });
}

// * Hook for real-time comments with Supabase subscriptions
export function useCommentsRealtime(
  designFileId: string
): UseQueryResult<Comment[], Error> & { unreadCount: number } {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Get the basic query result
  const queryResult = useQuery({
    queryKey: commentKeys.byDesignFile(designFileId),
    queryFn: () => commentsApi.getComments(designFileId),
    enabled: !!designFileId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!designFileId) return;

    // Create channel for this design file
    const channel = supabase
      .channel(`comments-${designFileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `design_file_id=eq.${designFileId}`,
        },
        (payload) => {
          console.log("Realtime comment change:", payload);

          // Invalidate and refetch comments to get fresh data with user profiles
          queryClient.invalidateQueries({
            queryKey: commentKeys.byDesignFile(designFileId),
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [designFileId, queryClient]);

  // For now, return 0 unread count - can be enhanced later
  return {
    ...queryResult,
    unreadCount: 0,
  };
}

// * Hook for real-time project comments
export function useProjectCommentsRealtime(
  projectId: string
): UseQueryResult<Comment[], Error> & { unreadCount: number } {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Get the basic query result
  const queryResult = useQuery({
    queryKey: commentKeys.byProject(projectId),
    queryFn: () => commentsApi.getProjectComments(projectId),
    enabled: !!projectId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!projectId) return;

    // Create channel for this project's comments
    const channel = supabase
      .channel(`project-comments-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log("🔥 Realtime project comment update:", payload);

          // Only show notification for INSERT events (new comments)
          if (payload.eventType === "INSERT") {
            console.log("✨ New comment received via realtime!");
          }

          // Invalidate and refetch comments to get fresh data with user profiles
          queryClient.invalidateQueries({
            queryKey: commentKeys.byProject(projectId),
          });
        }
      )
      .subscribe();

    console.log(`🚀 Subscribed to realtime updates for project: ${projectId}`);
    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        console.log(`🔌 Unsubscribing from project: ${projectId}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId, queryClient]);

  // For now, return 0 unread count - can be enhanced later
  return {
    ...queryResult,
    unreadCount: 0,
  };
}
