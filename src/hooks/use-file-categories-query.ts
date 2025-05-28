import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { fileCategoriesApi } from "@/app/api/fileCategories";
import {
  FileCategory,
  CreateFileCategoryData,
  UpdateFileCategoryData,
} from "@/lib/types/fileCategory";

// * Query key factory
const categoryKeys = {
  all: ["fileCategories"] as const,
  byProject: (projectId: string) =>
    [...categoryKeys.all, "project", projectId] as const,
  details: (id: string) => [...categoryKeys.all, id] as const,
};

// * Hook for fetching categories for a project
export function useFileCategories(
  projectId: string
): UseQueryResult<FileCategory[], Error> {
  return useQuery({
    queryKey: categoryKeys.byProject(projectId),
    queryFn: () => fileCategoriesApi.getCategories(projectId),
    enabled: !!projectId,
  });
}

// * Hook for creating a category
export function useCreateFileCategory(): UseMutationResult<
  FileCategory,
  Error,
  CreateFileCategoryData
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFileCategoryData) =>
      fileCategoriesApi.createCategory(data),
    onSuccess: (newCategory) => {
      // Update the cache for this project
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byProject(newCategory.project_id),
      });

      // Optimistically update the cache
      queryClient.setQueryData(
        categoryKeys.byProject(newCategory.project_id),
        (oldData: FileCategory[] | undefined) => {
          return oldData ? [...oldData, newCategory] : [newCategory];
        }
      );
    },
  });
}

// * Hook for updating a category
export function useUpdateFileCategory(): UseMutationResult<
  FileCategory,
  Error,
  { id: string; updates: UpdateFileCategoryData; projectId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) =>
      fileCategoriesApi.updateCategory(id, updates),
    onSuccess: (updatedCategory, { projectId }) => {
      // Update the cache
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byProject(projectId),
      });

      queryClient.setQueryData(
        categoryKeys.byProject(projectId),
        (oldData: FileCategory[] | undefined) => {
          if (!oldData) return [updatedCategory];
          return oldData.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          );
        }
      );
    },
  });
}

//* Hook for deleting a category
export function useDeleteFileCategory(): UseMutationResult<
  void,
  Error,
  { id: string; projectId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => fileCategoriesApi.deleteCategory(id),
    onSuccess: (_, { id, projectId }) => {
      // Update the cache
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byProject(projectId),
      });

      queryClient.setQueryData(
        categoryKeys.byProject(projectId),
        (oldData: FileCategory[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((category) => category.id !== id);
        }
      );

      // invalidate design files queries since category assignments changed
      queryClient.invalidateQueries({ queryKey: ["designFiles"] });
    },
  });
}

// * Hook for assigning files to categories
export function useAssignFileToCategory(): UseMutationResult<
  void,
  Error,
  { fileId: string; categoryId: string | null; projectId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, categoryId }) =>
      fileCategoriesApi.assignFileToCategory(fileId, categoryId),
    onSuccess: (_, { projectId }) => {
      // Invalidate both categories and files queries
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byProject(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ["designFiles", "project", projectId],
      });
    },
  });
}
