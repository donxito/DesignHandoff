import { supabase } from "@/lib/supabase/client";
import { Comment, CreateCommentData } from "@/lib/types/comment";
import { User } from "@/lib/types/user";

interface CommentWithProfile extends Omit<Comment, "user" | "replies"> {
  profiles: User;
  replies?: CommentWithProfile[];
}

// * Extended interface for project-level comments
export interface CreateProjectCommentData {
  projectId: string;
  content: string;
  x?: number | null;
  y?: number | null;
  parentId?: string | null;
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
              replies: [], // Nested replies not supported yet
            }))
          : [],
      };
      return transformedComment;
    });
  },

  // * Fetches project-level comments
  async getProjectComments(projectId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles!inner(id, full_name, avatar_url, created_at, updated_at)
        `
        )
        .eq("project_id", projectId)
        .is("parent_id", null) // Only fetch top-level comments
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch project comments: ${error.message}`);
      }

      // Map the Supabase result to the Comment type with safe typing
      const typedData = data as unknown as CommentWithProfile[];
      return typedData.map((comment: CommentWithProfile) => ({
        id: comment.id,
        content: comment.content,
        x: comment.x,
        y: comment.y,
        design_file_id: comment.design_file_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: comment.profiles
          ? {
              id: comment.profiles.id,
              full_name: comment.profiles.full_name,
              avatar_url: comment.profiles.avatar_url,
              created_at: comment.profiles.created_at,
              updated_at: comment.profiles.updated_at,
            }
          : undefined,
        replies: [],
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to fetch project comments: ${errorMessage}`);
    }
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

    const commentWithProfile = data as unknown as CommentWithProfile;

    return {
      ...commentWithProfile,
      user: commentWithProfile.profiles,
      replies: [],
    };
  },

  // * Creates a new project-level comment
  async createProjectComment(
    commentData: CreateProjectCommentData
  ): Promise<Comment> {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      throw new Error("Authentication required");
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        project_id: commentData.projectId,
        content: commentData.content,
        x: commentData.x || null,
        y: commentData.y || null,
        user_id: userId,
        parent_id: commentData.parentId || null,
      })
      .select(
        `
        id,
        content,
        x,
        y,
        design_file_id,
        user_id,
        parent_id,
        created_at,
        updated_at,
        project_id,
        profiles!inner(id, full_name, avatar_url, created_at, updated_at)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create project comment: ${error.message}`);
    }

    // Transform the result to our Comment type with safe typing
    const dbResult = data as unknown as CommentWithProfile;
    return {
      id: dbResult.id,
      content: dbResult.content,
      x: dbResult.x,
      y: dbResult.y,
      design_file_id: dbResult.design_file_id,
      user_id: dbResult.user_id,
      parent_id: dbResult.parent_id,
      created_at: dbResult.created_at,
      updated_at: dbResult.updated_at,
      user: dbResult.profiles
        ? {
            id: dbResult.profiles.id,
            full_name: dbResult.profiles.full_name,
            avatar_url: dbResult.profiles.avatar_url,
            created_at: dbResult.profiles.created_at,
            updated_at: dbResult.profiles.updated_at,
          }
        : undefined,
      replies: [],
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
