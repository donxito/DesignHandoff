// src/hooks/use-comments-query.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { commentsApi } from "@/lib/api/comments";
import { Comment, CreateCommentData } from "@/lib/types/comment";

// * Query key factory
const commentKeys = {
  all: ["comments"] as const,
  byDesignFile: (fileId: string) =>
    [...commentKeys.all, "file", fileId] as const,
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
