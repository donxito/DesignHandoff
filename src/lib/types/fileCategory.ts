import { Database } from "./supabase";

export type DbFileCategory =
  Database["public"]["Tables"]["file_categories"]["Row"];

export interface FileCategory extends DbFileCategory {
  //Extended properties for UI
  files_count?: number;
}

export interface DesignFileWithCategory {
  id: string;
  name: string;
  file_url: string;
  project_id: string;
  category_id: string | null;
  category?: FileCategory | null;
  created_at: string | null;
  updated_at: string | null;
  uploaded_by: string;
  thumbnail_url: string | null;
}

export interface CreateFileCategoryData {
  project_id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateFileCategoryData {
  name?: string;
  color?: string;
  description?: string;
}

// * Predefined category colors for quick selection
export const CATEGORY_COLORS = [
  "#EC4899", // Pink
  "#10B981", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#84CC16", // Lime
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

// * Default categories that can be created for new projects
export const DEFAULT_CATEGORIES: Omit<CreateFileCategoryData, "project_id">[] =
  [
    {
      name: "Design Files",
      color: "#EC4899",
      description: "Main design files and mockups",
    },
    {
      name: "Assets",
      color: "#10B981",
      description: "Icons, images, and other assets",
    },
    {
      name: "Documentation",
      color: "#3B82F6",
      description: "Specs, guidelines, and documentation",
    },
  ];
