
import { RunEvent } from '@/types';
import { runEventsService } from '@/services/runEventsService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useRunDetails = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: run, isLoading, error } = useQuery<RunEvent | null>({
    queryKey: ['run-details', id],
    queryFn: async () => {
      if (!id) return null;

      // First try to get the run from the cached runs list
      const cachedRuns = queryClient.getQueryData<RunEvent[]>(['runs']);
      if (cachedRuns) {
        const cachedRun = cachedRuns.find(run => run.id === id);
        if (cachedRun) {
          console.log('✅ useRunDetails: Found run in cache, avoiding API call');
          return cachedRun;
        }
      }

      // Only make API call if not found in cache
      console.log('🔄 useRunDetails: Run not in cache, fetching from API...');
      return runEventsService.getEvent(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error && error.toString().includes('429')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 5000,
  });

  return { 
    run: run || null, 
    isLoading,
    error: error ? (error.toString().includes('429') ? 'Rate limited - please wait and try again' : 'Failed to load run details') : null
  };
};
