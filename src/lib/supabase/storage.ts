import { supabase } from './client';

/**
 * Storage utility functions for Supabase
 */

/**
 * Gets a public URL for a file in a bucket
 * @param bucket The bucket name
 * @param filePath The file path within the bucket
 * @returns The public URL for the file
 */
export const getPublicUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Uploads a file to a specified bucket
 * @param bucket The bucket name
 * @param filePath The path to save the file to
 * @param file The file to upload
 * @returns Promise with the upload result
 */
export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) {
    throw error;
  }
    
  return getPublicUrl(bucket, filePath);
};
