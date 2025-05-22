import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { usersApi } from "@/app/api/users";
import { User } from "@/lib/types/user";

// * Query key factory
const userKeys = {
  all: ["users"] as const,
  current: () => [...userKeys.all, "current"] as const,
  details: (id: string) => [...userKeys.all, , id] as const,
};

// * Hook for fetching the current user profile
export function useCurrentUser(): UseQueryResult<User | null, Error> {
  return useQuery({
    queryKey: userKeys.current(), // Query key
    queryFn: () => usersApi.getCurrentUser(), // Query function
  });
}

// * Hook for fetching a user by ID
export function useUser(id: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: userKeys.details(id), // Query key
    queryFn: () => usersApi.getUserById(id), // Query function
    enabled: !!id, // Only fetch if ID is provided
  });
}

// * Hook for updating the current user profile
export function useUpdateProfile(): UseMutationResult<
  User,
  Error,
  Partial<User>
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => usersApi.updateProfile(updates),
    onSuccess: (updatedUser) => {
      // Invalidate the current user query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: userKeys.current() });

      // Update the cache with the new user data
      queryClient.setQueryData(userKeys.current(), updatedUser);

      // update the cache with the new user data
      queryClient.setQueryData(userKeys.details(updatedUser.id), updatedUser);
    },
  });
}
