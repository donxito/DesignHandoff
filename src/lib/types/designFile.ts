import { Database } from "./supabase";
import { User } from "./user";

export type DbDesignFile = Database['public']['Tables']['design_files']['Row'];

// TODO: The 'design_specs' table doesn't exist in the current Supabase database schema. Mayeb I should create it if needed.


export interface DesignFile extends DbDesignFile {
  uploader?: User;
  comments_count?: number;
}

export type DesignSpecType = 'color' | 'spacing' | 'typography' | 'asset';

export interface DesignSpec {
  id: string;
  design_file_id: string;
  type: DesignSpecType;
  name: string;
  value: string;
  created_at: string;
  updated_at: string | null;
  // Any additional properties
}

export interface UploadFileParams {
  projectId: string;
  file: File;
  name?: string;
  onProgress?: (progress: number) => void;
}

export interface FileMetadata {
  contentType: string;
  size: number;
  lastModified?: number;
  name: string;
}