
import { useState, useEffect, useCallback, useMemo } from 'react';
import { RunEvent, RunRegistration } from '@/types';
import { isDatePast } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { runEventsService } from '@/services/runEventsService';
import { registrationService } from '@/services/registrationService';

export const useBusinessData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingRuns, setUpcomingRuns] = useState<RunEvent[]>([]);
  const [pastRuns, setPastRuns] = useState<RunEvent[]>([]);
  const [runParticipants, setRunParticipants] = useState<{ [runId: string]: RunRegistration[] }>({});
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [recentParticipants, setRecentParticipants] = useState<RunRegistration[]>([]);
  
  const { user } = useAuth();
  
  // Function to immediately remove a run from state
  const removeRunFromState = useCallback((runId: string) => {
    console.log('Removing run from state immediately:', runId);
    
    // Remove from upcoming runs
    setUpcomingRuns(prev => {
      const filtered = prev.filter(run => run.id !== runId);
      console.log('Updated upcoming runs:', filtered.length);
      return filtered;
    });
    
    // Remove from past runs
    setPastRuns(prev => {
      const filtered = prev.filter(run => run.id !== runId);
      console.log('Updated past runs:', filtered.length);
      return filtered;
    });
    
    // Remove participants for this run and update counts
    setRunParticipants(prev => {
      const newParticipants = { ...prev };
      const removedParticipants = newParticipants[runId] || [];
      delete newParticipants[runId];
      
      // Update total participants count
      const removedCount = removedParticipants.length;
      setTotalParticipants(current => {
        const newTotal = Math.max(0, current - removedCount);
        console.log('Updated total participants:', newTotal);
        return newTotal;
      });
      
      // Remove from recent participants
      setRecentParticipants(current => {
        const filtered = current.filter(participant => participant.runId !== runId);
        console.log('Updated recent participants:', filtered.length);
        return filtered;
      });
      
      return newParticipants;
    });
    
    console.log('Run removed from state successfully');
  }, []);
  
  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchBusinessData = useCallback(async () => {
    if (!user || !user?.id || user.id.startsWith('temp-')) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching business data for user:', user.id);
      
      let businessRuns: RunEvent[] = [];
      
      // Fetch business events from API - this should be fast
      if (user?.role === 'business') {
        try {
          console.log('Fetching business events for business ID:', user.id);
          const apiRuns = await runEventsService.getBusinessEvents(user.id);
          console.log('Fetched business events from API:', apiRuns);
          businessRuns = [...apiRuns];
          
          // Immediately update runs without participant data to show content quickly
          const upcoming = businessRuns.filter(run => !isDatePast(run.date));
          const past = businessRuns.filter(run => isDatePast(run.date));
          
          // Sort upcoming runs by date (earliest first)
          upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Sort past runs by date (most recent first)
          past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Set runs immediately to show content faster
          setUpcomingRuns(upcoming);
          setPastRuns(past);
          setIsLoading(false); // Allow UI to show runs immediately
          
        } catch (error) {
          console.error('Error fetching business events from API:', error);
          businessRuns = [];
          setIsLoading(false);
          return;
        }
      } else {
        setIsLoading(false);
        return;
      }
      
      console.log('All business runs:', businessRuns);
      
      // Fetch registration data in parallel for better performance
      const fetchParticipantsInBackground = async () => {
        const participants: { [runId: string]: RunRegistration[] } = {};
        let allParticipants: RunRegistration[] = [];
        
        // Use Promise.all to fetch all registrations in parallel
        const registrationPromises = businessRuns.map(async (run) => {
          try {
            console.log('Fetching registrations for run:', run.id);
            const runRegistrations = await registrationService.getEventRegistrations(run.id);
            console.log('Registrations for run', run.id, ':', runRegistrations);
            
            // Create clean copies to avoid circular references
            const cleanRegistrations = runRegistrations.map(reg => ({
              id: reg.id,
              runId: reg.runId,
              userId: reg.userId,
              userName: reg.userName,
              userEmail: reg.userEmail,
              userPace: reg.userPace,
              registeredAt: reg.registeredAt,
              status: reg.status
            }));
            
            return { runId: run.id, registrations: cleanRegistrations };
          } catch (error) {
            console.error('Error fetching registrations for run', run.id, ':', error);
            return { runId: run.id, registrations: [] };
          }
        });
        
        // Wait for all registration requests to complete
        const results = await Promise.all(registrationPromises);
        
        // Process results
        results.forEach(({ runId, registrations }) => {
          participants[runId] = registrations;
          allParticipants = [...allParticipants, ...registrations];
          
          // Update the run objects with accurate participant counts
          setUpcomingRuns(prev => prev.map(run => 
            run.id === runId ? { ...run, currentParticipants: registrations.length } : run
          ));
          setPastRuns(prev => prev.map(run => 
            run.id === runId ? { ...run, currentParticipants: registrations.length } : run
          ));
        });
        
        // Get recent participants (last 5, sorted by registration date)
        const recentSignups = allParticipants
          .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
          .slice(0, 5)
          .map(participant => ({
            id: participant.id,
            runId: participant.runId,
            userId: participant.userId,
            userName: participant.userName,
            userEmail: participant.userEmail,
            userPace: participant.userPace,
            registeredAt: participant.registeredAt,
            status: participant.status
          }));
        
        setRunParticipants(participants);
        setTotalParticipants(allParticipants.length);
        setRecentParticipants(recentSignups);
        
        console.log('Participant data loaded in background');
      };
      
      // Start fetching participants in the background
      fetchParticipantsInBackground().catch(error => {
        console.error('Error fetching participants in background:', error);
      });
      
      console.log('Business runs loaded immediately, participant data loading in background');
      
    } catch (error) {
      console.error('Error fetching business data:', error);
      // Reset to empty state on error
      setUpcomingRuns([]);
      setPastRuns([]);
      setRunParticipants({});
      setTotalParticipants(0);
      setRecentParticipants([]);
      setIsLoading(false);
    }
  }, [user?.id, user?.role]); // Only depend on user id and role

  // Fetch data when user changes
  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  // Memoize the total run count to prevent unnecessary recalculations
  const getTotalRunCount = useMemo(() => {
    return upcomingRuns.length + pastRuns.length;
  }, [upcomingRuns.length, pastRuns.length]);
  
  return {
    isLoading,
    upcomingRuns,
    pastRuns,
    runParticipants,
    totalParticipants,
    recentParticipants,
    getTotalRunCount: () => getTotalRunCount,
    refreshData: fetchBusinessData,
    removeRunFromState
  };
};
