
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RunEvent } from '@/types';
import RunCard from '@/components/runs/RunCard';
import { isDatePast } from '@/utils/helpers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { registrationService } from '@/services/registrationService';
import { runEventsService } from '@/services/runEventsService';
import { useQuery } from '@tanstack/react-query';

const MyRunsPage = () => {
  const { user } = useAuth();

  // Get user registrations with caching
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ['user-registrations', user?.id],
    queryFn: () => registrationService.getUserRegistrations(user?.id || ''),
    enabled: !!user?.id && !user.id.startsWith('temp-'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get all events with caching
  const { data: allEvents = [], isLoading: eventsLoading } = useQuery<RunEvent[]>({
    queryKey: ['runs'],
    queryFn: runEventsService.getAllEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoize user runs calculation
  const { upcomingRuns, pastRuns } = useMemo(() => {
    if (registrations.length === 0 || allEvents.length === 0) {
      return { upcomingRuns: [], pastRuns: [] };
    }

    const userRunIds = registrations.map(reg => reg.runId);
    const userRuns = allEvents.filter(run => userRunIds.includes(run.id));
    
    const upcoming = userRuns.filter(run => !isDatePast(run.date));
    const past = userRuns.filter(run => isDatePast(run.date));
    
    return { upcomingRuns: upcoming, pastRuns: past };
  }, [registrations, allEvents]);

  const isLoading = registrationsLoading || eventsLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          <h1 className="text-3xl font-bold mb-6">My Runs</h1>
          
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="upcoming">
                  {upcomingRuns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingRuns.map(run => (
                        <RunCard key={run.id} run={run} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl font-medium">No upcoming runs</p>
                      <p className="text-muted-foreground mt-2 mb-6">
                        You haven't registered for any upcoming runs yet.
                      </p>
                      <Link 
                        to="/runs" 
                        className="text-pacers-blue hover:underline"
                      >
                        Browse runs to join
                      </Link>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastRuns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastRuns.map(run => (
                        <RunCard key={run.id} run={run} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl font-medium">No past runs</p>
                      <p className="text-muted-foreground mt-2">
                        You haven't completed any runs yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyRunsPage;
