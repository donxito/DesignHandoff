import { supabase } from "@/lib/supabase/client";
import {
  FileCategory,
  CreateFileCategoryData,
  UpdateFileCategoryData,
} from "@/lib/types/fileCategory";

// * API for file categories
export const fileCategoriesApi = {
  // Get all categories for a project
  async getCategories(projectId: string): Promise<FileCategory[]> {
    const { data, error } = await supabase
      .from("file_categories")
      .select(
        `
        *,
        design_files(count)
      `
      )
      .eq("project_id", projectId)
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return (data || []).map((category) => ({
      ...category,
      files_count: category.design_files?.[0]?.count || 0,
    }));
  },

  // Create a new category
  async createCategory(
    categoryData: CreateFileCategoryData
  ): Promise<FileCategory> {
    const { data, error } = await supabase
      .from("file_categories")
      .insert({
        project_id: categoryData.project_id,
        name: categoryData.name,
        color: categoryData.color || "#3B82F6",
        description: categoryData.description || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return {
      ...data,
      files_count: 0,
    };
  },

  // Update a category
  async updateCategory(
    id: string,
    updates: UpdateFileCategoryData
  ): Promise<FileCategory> {
    const { data, error } = await supabase
      .from("file_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    // First, update all files in this category to have no category
    const { error: updateError } = await supabase
      .from("design_files")
      .update({ category_id: null })
      .eq("category_id", id);

    if (updateError) {
      throw new Error(`Failed to update files: ${updateError.message}`);
    }

    // Then delete the category
    const { error: deleteError } = await supabase
      .from("file_categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete category: ${deleteError.message}`);
    }
  },

  // Assign a file to a category
  async assignFileToCategory(
    fileId: string,
    categoryId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from("design_files")
      .update({ category_id: categoryId })
      .eq("id", fileId);

    if (error) {
      throw new Error(`Failed to assign file to category: ${error.message}`);
    }
  },
};
