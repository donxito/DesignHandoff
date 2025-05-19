import { QueryClient, QueryCacheNotifyEvent } from "@tanstack/react-query";

// * Helper to synchronize TanStack Query data with Zustand stores
export const syncQueryToStore = <T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  setter: (data: T) => void
) => {
  // Get initial data from cache if available
  const cachedData = queryClient.getQueryData<T>(queryKey);
  if (cachedData) {
    setter(cachedData);
  }

  // Subscribe to query changes
  const unsubscribe = queryClient
    .getQueryCache()
    .subscribe((event: QueryCacheNotifyEvent) => {
      // Check if the event type is 'updated' and if the query causing the event has a queryKey
      if (event.type === "updated" && event.query.queryKey) {
        // Stringify the query key from the event and the target query key for comparison
        const updatedKey = JSON.stringify(event.query.queryKey);
        const targetKey = JSON.stringify(queryKey);

        // If the keys match and there's data in the query state, call the setter with the new data
        if (updatedKey === targetKey && event.query.state.data) {
          setter(event.query.state.data as T);
        }
      }
    });

  // Return cleanup function
  return unsubscribe;
};

// * Example usage
// const queryClient = new QueryClient();
// const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => fetchUser() });
// syncQueryToStore(queryClient, ["user"], (user) => setUser(user));
