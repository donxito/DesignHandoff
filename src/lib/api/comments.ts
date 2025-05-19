import { supabase } from "../supabase/client";
import { Comment, CreateCommentData } from "../types/comment";
import { User } from "../types/user";

// Define type for raw Supabase response
type SupabaseCommentResponse = {
  id: string;
  content: string;
  x: number | null;
  y: number | null;
  design_file_id: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profiles: User;
  replies?: SupabaseCommentResponse[];
};

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
    return data.map((comment: any) => {
      // Transform to our Comment type
      const transformedComment: Comment = {
        ...comment,
        user: comment.profiles,
        replies: Array.isArray(comment.replies)
          ? comment.replies.map((reply: any) => ({
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
