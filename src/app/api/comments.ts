import { supabase } from "@/lib/supabase/client";
import { Comment, CreateCommentData } from "@/lib/types/comment";
import { User } from "@/lib/types/user";

interface CommentWithProfile extends Omit<Comment, "user" | "replies"> {
  profiles: User;
  replies?: CommentWithProfile[];
}

export const commentsApi = {
  // * Fetches comments for a design file
  async getComments(designFileId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles:user_id(id, full_name, avatar_url, created_at, updated_at),
        replies:comments!parent_id(
          *,
          profiles:user_id(id, full_name, avatar_url, created_at, updated_at)
        )
      `
      )
      .eq("design_file_id", designFileId)
      .is("parent_id", null) // Only fetch top-level comments
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    // Map the Supabase result to the Comment type
    return data.map((comment: unknown) => {
      const commentData = comment as CommentWithProfile;
      // Transform to our Comment type
      const transformedComment: Comment = {
        ...commentData,
        user: commentData.profiles,
        replies: Array.isArray(commentData.replies)
          ? commentData.replies.map((reply) => ({
              ...reply,
              user: reply.profiles,
            }))
          : undefined,
      };
      return transformedComment;
    });
  },

  // * Creates a new comment
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      throw new Error("Authentication required");
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        design_file_id: commentData.designFileId,
        content: commentData.content,
        x: commentData.x || null,
        y: commentData.y || null,
        user_id: userId,
        parent_id: commentData.parentId || null,
      })
      .select(
        `
        *,
        profiles:user_id(id, full_name, avatar_url, created_at, updated_at)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    // Map the single created comment result to the Comment type
    return {
      ...data,
      user: data.profiles,
    };
  },

  // * Deletes a comment
  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  },
};
