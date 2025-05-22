import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { designFilesApi } from "@/app/api/designFiles";
import { DesignFile, UploadFileParams } from "@/lib/types/designFile";

// * Query key factory
const designFileKeys = {
  all: ["designFiles"] as const,
  byProject: (projectId: string) =>
    [...designFileKeys.all, "project", projectId] as const,
  details: (id: string) => [...designFileKeys.all, id] as const,
};

// * Hook for fetching design files for a project
export function useDesignFiles(
  projectId: string
): UseQueryResult<DesignFile[], Error> {
  return useQuery({
    queryKey: designFileKeys.byProject(projectId), // Query key
    queryFn: () => designFilesApi.getDesignFiles(projectId), // return a function
    enabled: !!projectId, // Only run if we have a project ID
  });
}

//* Hook for fetching a design file by ID
export function useDesignFile(id: string): UseQueryResult<DesignFile, Error> {
  return useQuery({
    queryKey: designFileKeys.details(id),
    queryFn: () => designFilesApi.getDesignFileById(id),
    enabled: !!id, // Only run if we have an ID
  });
}

// * Hook for uploading a design file
export function useUploadDesignFile(): UseMutationResult<
  DesignFile,
  Error,
  UploadFileParams
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadFileParams) =>
      designFilesApi.uploadDesignFile(params),
    onSuccess: (newFile) => {
      // Invalidate and refetch files for this project
      queryClient.invalidateQueries({
        queryKey: designFileKeys.byProject(newFile.project_id),
      });

      // Optionally update the cache for immediate UI update
      queryClient.setQueryData(
        designFileKeys.byProject(newFile.project_id),
        (oldData: DesignFile[] | undefined) => {
          return oldData ? [newFile, ...oldData] : [newFile];
        }
      );
    },
  });
}

//* Hook for deleting a design file
//* Requires projectId for cache updates
export function useDeleteDesignFile(): UseMutationResult<
  void,
  Error,
  { id: string; file_url: string; projectId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file_url }: { id: string; file_url: string; projectId: string }) =>
      designFilesApi.deleteDesignFile(id, file_url),
    onSuccess: (_, { id, projectId }) => {
      // Invalidate and refetch files for this project
      queryClient.invalidateQueries({
        queryKey: designFileKeys.byProject(projectId),
      });

      // Optionally update the cache for immediate UI update
      queryClient.setQueryData(
        designFileKeys.byProject(projectId),
        (oldData: DesignFile[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((file) => file.id !== id);
        }
      );

      // Remove the specific file from the cache
      queryClient.removeQueries({ queryKey: designFileKeys.details(id) });
    },
  });
}
