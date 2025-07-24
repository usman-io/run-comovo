// Global cache invalidation utility
let queryClient: any = null;

export const setQueryClient = (client: any) => {
  queryClient = client;
};

export const invalidateRunsCache = () => {
  if (queryClient) {
    console.log('🗑️ Invalidating React Query runs cache');
    queryClient.invalidateQueries({ queryKey: ['runs'] });
  }
};

export const invalidateAllCaches = () => {
  invalidateRunsCache();
  console.log('🗑️ All caches invalidated');
};