import { supabase } from "@/lib/supabase/client";
import { DesignFile, UploadFileParams } from "@/lib/types/designFile";

export const designFilesApi = {
  // * Fetches design files for a specific project
  async getDesignFiles(projectId: string): Promise<DesignFile[]> {
    const { data, error } = await supabase
      .from("design_files")
      .select(
        `
        *,
        comments(count)
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch design files: ${error.message}`);
    }

    return (data || []).map((file) => {
      return {
        ...file,
        uploader: undefined,
        comments_count: file.comments?.[0]?.count || 0,
        file_name: file.name,
        file_type: file.name.split(".").pop()?.toLowerCase() || "",
        file_url: file.file_url,
        file_size: 0,
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
        comments(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch design file: ${error.message}`);
    }

    return {
      ...data,
      uploader: undefined,
      comments_count: data.comments?.[0]?.count || 0,
      file_name: data.name,
      file_type: data.name.split(".").pop()?.toLowerCase() || "",
      file_url: data.file_url,
      file_size: 0,
    };
  },

  // * Uploads a new design file
  async uploadDesignFile({
    projectId,
    file,
    fileName,
    fileType,
    name,
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

      return {
        ...data,
        file_name: data.name,
        file_type: fileType || file.type,
        file_url: data.file_url,
        file_size: file.size,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    }
  },

  //* Deletes a design file from Supabase storage and database.
  async deleteDesignFile(id: string, fileUrl: string): Promise<void> {
    // Extract storage path from fileUrl (assuming public URL format)
    try {
      // Example: https://<project>.supabase.co/storage/v1/object/public/design-files/PROJECT_ID/filename.ext
      const pathMatch = fileUrl.match(/\/design-files\/(.+)$/);
      if (!pathMatch || !pathMatch[1]) {
        throw new Error("Could not extract storage path from file URL.");
      }
      const storagePath = pathMatch[1];

      // Delete from storage bucket
      const { error: storageError } = await supabase.storage
        .from("design-files")
        .remove([storagePath]);
      if (storageError) {
        throw new Error(
          `Failed to delete file from storage: ${storageError.message}`
        );
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("design_files")
        .delete()
        .eq("id", id);
      if (dbError) {
        throw new Error(
          `Failed to delete design file from database: ${dbError.message}`
        );
      }
    } catch (err) {
      throw new Error(
        `Failed to fully delete design file: ${(err as Error).message}`
      );
    }
  },
};
