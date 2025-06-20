"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useFileCategories,
  useCreateFileCategory,
  useUpdateFileCategory,
  useDeleteFileCategory,
} from "@/hooks/use-file-categories-query";
import { FileCategory, CATEGORY_COLORS } from "@/lib/types/fileCategory";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Badge } from "@/components/retroui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { Plus, FolderPlus, Edit3, Trash2, Files, Palette } from "lucide-react";
import { FileListSkeleton } from "@/components/retroui/skeletons";

interface CategoryManagerProps {
  projectId: string;
}

export function CategoryManager({ projectId }: CategoryManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FileCategory | null>(
    null
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(
    CATEGORY_COLORS[0]
  );

  const { toast } = useToast();
  const { data: categories = [], isLoading } = useFileCategories(projectId);
  const createCategoryMutation = useCreateFileCategory();
  const updateCategoryMutation = useUpdateFileCategory();
  const deleteCategoryMutation = useDeleteFileCategory();

  // * Handle create category
  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      await createCategoryMutation.mutateAsync({
        project_id: projectId,
        name: categoryName.trim(),
        color: selectedColor || undefined,
        description: categoryDescription.trim() || undefined,
      });

      toast({
        message: "Category Created",
        description: `"${categoryName}" category has been created.`,
        variant: "success",
      });

      resetForm();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        message: "Error",
        description: "Failed to create category. Please try again.",
        variant: "error",
      });
    }
  };

  // * Handle edit category
  const handleEditCategory = (category: FileCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setSelectedColor(category.color ?? CATEGORY_COLORS[0]); // Ensure no null is passed, fallback to default color
  };

  // * Handle update category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        projectId,
        updates: {
          name: categoryName.trim(),
          color: selectedColor ?? undefined, // Ensure null is converted to undefined for type safety
          description: categoryDescription.trim() || undefined,
        },
      });

      toast({
        message: "Category Updated",
        description: `"${categoryName}" has been updated.`,
        variant: "success",
      });

      resetForm();
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        message: "Error",
        description: "Failed to update category. Please try again.",
        variant: "error",
      });
    }
  };

  // * Handle delete category
  const handleDeleteCategory = async (category: FileCategory) => {
    if (
      !confirm(
        `Delete "${category.name}" category? Files will be uncategorized.`
      )
    ) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync({
        id: category.id,
        projectId,
      });

      toast({
        message: "Category Deleted",
        description: `"${category.name}" has been deleted.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        message: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "error",
      });
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setSelectedColor(CATEGORY_COLORS[0]);
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FolderPlus className="h-6 w-6 text-blue-500" />
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              File Categories
            </Text>
          </div>
          <FileListSkeleton count={3} />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderPlus className="h-6 w-6 text-blue-500" />
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              File Categories
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-black dark:border-white"
                    style={{ backgroundColor: category.color ?? undefined }}
                  />
                  <div>
                    <Text
                      as="h4"
                      className="font-bold font-pixel text-black dark:text-white"
                    >
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text
                        as="p"
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        {category.description}
                      </Text>
                    )}
                  </div>
                  <Badge variant="secondary" size="sm" className="ml-2">
                    <Files className="h-3 w-3 mr-1" />
                    {category.files_count || 0}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                    className="border-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="border-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FolderPlus className="h-8 w-8 text-gray-400" />
            </div>
            <Text
              as="h4"
              className="text-lg font-bold font-pixel text-black dark:text-white mb-2"
            >
              No Categories Yet
            </Text>
            <Text
              as="p"
              className="font-pixel text-gray-600 dark:text-gray-300 mb-4"
            >
              Create categories to organize your design files.
            </Text>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create First Category
            </Button>
          </div>
        )}
      </Card>

      {/* Create/Edit Category Modal */}
      {(isCreateModalOpen || editingCategory) && (
        <Dialog
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateModalOpen(false);
              setEditingCategory(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-black dark:text-white"
              >
                {editingCategory ? "Edit Category" : "Create New Category"}
              </Text>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Input
                  label="Category Name"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Description (Optional)"
                  placeholder="Brief description of this category"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>

              <div>
                <Text className="block text-sm font-medium text-black dark:text-white mb-2">
                  <Palette className="h-4 w-4 inline mr-1" />
                  Category Color
                </Text>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-3 ${
                        selectedColor === color
                          ? "border-black dark:border-white scale-110"
                          : "border-gray-300 dark:border-gray-600"
                      } transition-all hover:scale-105`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingCategory(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={
                  editingCategory ? handleUpdateCategory : handleCreateCategory
                }
                disabled={
                  !categoryName.trim() ||
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              >
                {createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
