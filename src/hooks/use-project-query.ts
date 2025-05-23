import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { projectsApi } from "@/app/api/projects";
import {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectsResponse,
  ProjectQueryParams,
} from "@/lib/types/project";

// * Query key factory for project queries
const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "lists"] as const,
  list: (params: ProjectQueryParams) =>
    [...projectKeys.lists(), params] as const,
  details: (id: string) => [...projectKeys.all, id] as const,
};

// * Hook for fetching all projects with filtering and sorting
export function useProjects(
  params: ProjectQueryParams = {}
): UseQueryResult<ProjectsResponse, Error> {
  return useQuery({
    queryKey: projectKeys.list(params), // Include params in query key for proper caching
    queryFn: () => projectsApi.getProjects(params), // Pass params to API
    staleTime: 30 * 1000, // 30 seconds
  });
}

// * Hook for fetching a single project by ID
export function useProject(id: string): UseQueryResult<Project, Error> {
  return useQuery({
    queryKey: projectKeys.details(id), // Query key
    queryFn: () => projectsApi.getProjectById(id), // return a function
    enabled: !!id, // Only fetch if id is provided
  });
}

// * Hook for creating a new project
export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  CreateProjectData
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.createProject(data),
    onSuccess: (newProject) => {
      // Invalidate and refetch all projects
      queryClient.invalidateQueries({ queryKey: projectKeys.all });

      // Optimistically update the cache
      queryClient.setQueryData(
        projectKeys.all,
        (oldData: Project[] | undefined) => {
          return oldData ? [newProject, ...oldData] : [newProject];
        }
      );
    },
  });
}

// * Hook for updating a project
export function useUpdateProject(
  id: string
): UseMutationResult<Project, Error, UpdateProjectData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectData) =>
      projectsApi.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Invalidate and refetch all projects
      queryClient.invalidateQueries({ queryKey: projectKeys.details(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });

      // Optimistically update the cache
      queryClient.setQueryData(projectKeys.details(id), updatedProject);

      // Update the project list as well
      queryClient.setQueryData(
        projectKeys.all,
        (oldData: Project[] | undefined) => {
          if (!oldData) return [updatedProject];

          return oldData.map((project) =>
            project.id === id ? updatedProject : project
          );
        }
      );
    },
  });
}

// * Hook for deleting a project
export function useDeleteProject(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Just use the projects API to delete the project
      await projectsApi.deleteProject(id);
    },
    onSuccess: (_, deletedId: string) => {
      // Invalidate and refetch all projects
      queryClient.invalidateQueries({ queryKey: projectKeys.all });

      // Remove the project from the cache
      queryClient.removeQueries({ queryKey: projectKeys.details(deletedId) });

      // Update the project list as well
      queryClient.setQueryData(
        projectKeys.all,
        (oldData: Project[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((project) => project.id !== deletedId);
        }
      );
    },
    onError: (error: Error) => {
      console.error("Error deleting project:", error);
    },
  });
}
