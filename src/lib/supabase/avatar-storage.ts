import { supabase } from "./client";

// * Avatar storage utilities for Supabase

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Upload user avatar to Supabase storage
 * @param file The avatar file to upload
 * @param userId The user ID
 * @returns Promise with the avatar URL
 */
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  // Validate file type
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image."
    );
  }

  // Validate file size
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error(
      "File size too large. Please upload an image smaller than 5MB."
    );
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Validate extension is in allowed list
  const allowedExts = ["jpeg", "jpg", "png", "gif", "webp"];
  if (!allowedExts.includes(fileExt)) {
    throw new Error("Invalid file extension");
  }
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Delete existing avatar if any
  await deleteExistingAvatar(userId);

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

/**
 * Delete existing avatar for a user
 * @param userId The user ID
 */
export const deleteExistingAvatar = async (userId: string): Promise<void> => {
  // List all files for this user
  const { data: files } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list("avatars", {
      search: userId,
    });

  if (files && files.length > 0) {
    // Delete all existing avatar files for this user
    const filesToDelete = files.map((file) => `avatars/${file.name}`);
    await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete);
  }
};

/**
 * Get avatar URL for a user
 * @param avatarPath The avatar path from the database
 * @returns The public URL or null
 */
export const getAvatarUrl = (avatarPath: string | null): string | null => {
  if (!avatarPath) return null;

  // If it's already a full URL, return as is
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  // Otherwise, get public URL from Supabase
  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(avatarPath);

  return data.publicUrl;
};

/**
 * Delete avatar by URL
 * @param avatarUrl The avatar URL to delete
 */
export const deleteAvatarByUrl = async (avatarUrl: string): Promise<void> => {
  if (!avatarUrl) return;

  // Extract file path from URL
  const url = new URL(avatarUrl);
  const pathParts = url.pathname.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const filePath = `avatars/${fileName}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error("Error deleting avatar:", error);
  }
};
