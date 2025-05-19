import { supabase } from "../supabase/client";
import { DesignFile, UploadFileParams } from "../types/designFile";
import { User } from "../types/user";

export const designFilesApi = {
  // * Fetches design files for a specific project
  async getDesignFiles(projectId: string): Promise<DesignFile[]> {
    const { data, error } = await supabase
      .from("design_files")
      .select(
        `
        *,
        profiles:uploaded_by(id, full_name, avatar_url),
        comments(count)
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch design files: ${error.message}`);
    }

    return (data || []).map((file) => {
      // Check if file.profiles is a valid User-like object by ensuring all selected fields are present.
      // This helps differentiate from a Supabase error object which wouldn't have these specific fields.
      const uploaderProfile =
        file.profiles &&
        typeof file.profiles === "object" &&
        "id" in file.profiles &&
        "full_name" in file.profiles && // Check for presence of selected fields
        "avatar_url" in file.profiles // Check for presence of selected fields
          ? file.profiles
          : undefined;

      return {
        ...file,
        uploader: uploaderProfile as User | undefined,
        comments_count: file.comments?.[0]?.count || 0,
      };
    });
  },

  // * Fetches a design file by ID
  async getDesignFileById(id: string): Promise<DesignFile> {
    const { data, error } = await supabase
      .from("design_files")
      .select(
        `
        *,
        profiles:uploaded_by(id, full_name, avatar_url),
        comments(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch design file: ${error.message}`);
    }

    // check for data.profiles.
    const uploaderProfile =
      data.profiles &&
      typeof data.profiles === "object" &&
      "id" in data.profiles &&
      "full_name" in data.profiles &&
      "avatar_url" in data.profiles
        ? data.profiles
        : undefined;

    return {
      ...data,
      uploader: uploaderProfile as User | undefined,
      comments_count: data.comments?.[0]?.count || 0,
    };
  },

  // * Uploads a new design file
  async uploadDesignFile({
    projectId,
    file,
    name,
    onProgress,
  }: UploadFileParams): Promise<DesignFile> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Authentication required");
      }

      const userId = sessionData.session.user.id;
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = `design-files/${projectId}/${fileName}`;

      // Create thumbnail for images (for demo purposes)
      let thumbnailUrl = null;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("design-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from("design-files")
        .getPublicUrl(filePath);

      // For images, use the same URL as thumbnail (for demo purposes)
      if (file.type.startsWith("image/")) {
        thumbnailUrl = publicUrlData.publicUrl;
      }

      // Create design file record in the database
      const { data, error } = await supabase
        .from("design_files")
        .insert({
          project_id: projectId,
          name: name || file.name,
          file_url: publicUrlData.publicUrl,
          thumbnail_url: thumbnailUrl,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    }
  },

  // * Deletes a design file
  async deleteDesignFile(id: string): Promise<void> {
    const { error } = await supabase.from("design_files").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete design file: ${error.message}`);
    }
  },
};
