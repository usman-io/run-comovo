
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RunEvent } from '@/types';
import RunCard from '@/components/runs/RunCard';
import RunFilters from '@/components/runs/RunFilters';
import { filterRuns, groupRunsByDate, getDateHeading, isEventInFuture } from '@/utils/helpers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, AlertCircle } from 'lucide-react';
import { runEventsService } from '@/services/runEventsService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

const RunsPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    pace: [] as string[],
    distance: [] as string[],
    selectedDate: undefined as Date | undefined,
    location: '',
    userLat: undefined as number | undefined,
    userLng: undefined as number | undefined,
  });

  // Use React Query with longer cache times to reduce API calls
  const { data: allRuns = [], isLoading, error: queryError } = useQuery<RunEvent[]>({
    queryKey: ['runs'],
    queryFn: runEventsService.getAllEvents,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased
    gcTime: 30 * 60 * 1000, // 30 minutes - increased  
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error && error.toString().includes('429')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 5000, // Wait 5 seconds before retry
  });

  // Memoize future runs calculation
  const futureRuns = useMemo(() => {
    if (allRuns.length === 0) return [];
    
    const filtered = allRuns.filter(run => isEventInFuture(run.date, run.time));
    
    return filtered.sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
  }, [allRuns]);

  // Memoize filtered runs
  const filteredRuns = useMemo(() => {
    return filterRuns(futureRuns, filters);
  }, [futureRuns, filters]);

  // Memoize grouped runs
  const groupedRuns = useMemo(() => {
    return groupRunsByDate(filteredRuns);
  }, [filteredRuns]);

  // Update error state when data changes
  useEffect(() => {
    if (queryError) {
      if (queryError.toString().includes('429')) {
        setError('Too many requests - please wait a moment and refresh the page.');
      } else {
        setError('Unable to load runs. Please check your connection and try again.');
      }
    } else if (!isLoading) {
      if (allRuns.length === 0) {
        setError('No runs available at the moment. Please try again later.');
      } else if (futureRuns.length === 0 && allRuns.length > 0) {
        setError('No upcoming runs found. All available runs appear to be in the past.');
      } else {
        setError(null);
      }
    }
  }, [allRuns, futureRuns, isLoading, queryError]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          <h1 className="text-3xl font-bold mb-6">Find Runs</h1>
          
          <RunFilters onFilterChange={handleFilterChange} />
          
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            // Loading state with skeleton
            <div className="space-y-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-8 bg-gray-100 rounded w-48 animate-pulse mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRuns.length > 0 ? (
            // Results grouped by date
            <div className="space-y-12">
              {Object.entries(groupedRuns)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, dateRuns]) => (
                  <div key={date}>
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <h2 className="text-xl font-semibold">{getDateHeading(date)}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dateRuns.map(run => (
                        <RunCard key={run.id} run={run} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // No results
            <div className="text-center py-12">
              <p className="text-xl font-medium">No upcoming runs found</p>
              <p className="text-muted-foreground mt-2">
                {futureRuns.length === 0 
                  ? "There might be a temporary issue loading runs. Please try refreshing the page."
                  : "Try adjusting your filters to find more runs"
                }
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RunsPage;
