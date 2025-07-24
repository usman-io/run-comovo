
import { useState, useEffect } from 'react';
import { RunEvent, RunRegistration } from '@/types';
import { format, subMonths } from 'date-fns';

export const useBusinessMetrics = (
  businessRuns: RunEvent[], 
  participants: { [runId: string]: RunRegistration[] },
  totalParticipants: number
) => {
  const [totalUniqueRunners, setTotalUniqueRunners] = useState(0);
  const [repeatRunnersPercentage, setRepeatRunnersPercentage] = useState(0);
  const [averageRunnersPerEvent, setAverageRunnersPerEvent] = useState(0);
  const [communityReturnRate, setCommunityReturnRate] = useState(0);
  const [newSignupsOverTime, setNewSignupsOverTime] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    calculateBusinessMetrics();
  }, [businessRuns, participants, totalParticipants]);

  // Helper function to safely parse dates
  const safeParseDate = (dateValue: any): Date | null => {
    try {
      if (!dateValue) return null;
      
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
      }
      
      // If it's a timestamp (number)
      if (typeof dateValue === 'number') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // If it's a string
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', dateValue, error);
      return null;
    }
  };

  // Calculate business metrics from real data
  const calculateBusinessMetrics = () => {
    console.log('=== BUSINESS METRICS CALCULATION START ===');
    console.log('Business runs:', businessRuns.length);
    console.log('Participants data:', participants);
    console.log('Total participants:', totalParticipants);
    
    // 1. Total unique runners (count distinct user IDs)
    const allParticipantIds = new Set<string>();
    
    Object.values(participants).forEach(runParticipants => {
      runParticipants.forEach(participant => {
        allParticipantIds.add(participant.userId);
      });
    });
    
    const uniqueRunnersCount = allParticipantIds.size;
    setTotalUniqueRunners(uniqueRunnersCount);
    
    // 2. Repeat runners percentage (runners who attended more than one event)
    const userRunCounts = new Map<string, number>();
    
    Object.values(participants).forEach(runParticipants => {
      runParticipants.forEach(participant => {
        const currentCount = userRunCounts.get(participant.userId) || 0;
        userRunCounts.set(participant.userId, currentCount + 1);
      });
    });
    
    const repeatRunners = Array.from(userRunCounts.values()).filter(count => count > 1).length;
    const repeatPercentage = uniqueRunnersCount > 0 
      ? Math.round((repeatRunners / uniqueRunnersCount) * 100) 
      : 0;
    
    setRepeatRunnersPercentage(repeatPercentage);
    
    // 3. Average runners per event
    const totalEvents = businessRuns.length;
    const avgPerEvent = totalEvents > 0 
      ? Math.round(totalParticipants / totalEvents) 
      : 0;
    
    setAverageRunnersPerEvent(avgPerEvent);

    // 4. Community return rate - calculate percentage of first-time runners who came back
    // Get all unique runners
    const runnersFirstEventMap = new Map<string, Date>();
    const runnersWithMultipleEvents = new Set<string>();
    
    // Process all registrations chronologically to track first events and returns
    const allRegistrations = Object.values(participants).flat().filter(reg => {
      const regDate = safeParseDate(reg.registeredAt);
      return regDate !== null;
    }).sort((a, b) => {
      const dateA = safeParseDate(a.registeredAt);
      const dateB = safeParseDate(b.registeredAt);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('All registrations with valid dates:', allRegistrations.length);
    console.log('Sample registrations:', allRegistrations.slice(0, 3));
    
    allRegistrations.forEach(reg => {
      const runnerId = reg.userId;
      const regDate = safeParseDate(reg.registeredAt);
      
      if (!regDate) return; // Skip invalid dates
      
      if (!runnersFirstEventMap.has(runnerId)) {
        // First time we're seeing this runner
        runnersFirstEventMap.set(runnerId, regDate);
      } else {
        // This runner has been to multiple events
        runnersWithMultipleEvents.add(runnerId);
      }
    });
    
    // Calculate return rate
    const totalFirstTimeRunners = runnersFirstEventMap.size;
    const returnedRunners = runnersWithMultipleEvents.size;
    const returnRate = totalFirstTimeRunners > 0 
      ? Math.round((returnedRunners / totalFirstTimeRunners) * 100) 
      : 0;
    
    setCommunityReturnRate(returnRate);
    
    // 5. New signups over time - NEW USERS by month (not total registrations)
    // Create array of last 6 months
    const newUsersByMonth = new Map<string, Set<string>>();
    const today = new Date();
    
    console.log('Today\'s date:', today);
    console.log('Current month format:', format(today, 'MMM'));
    
    // Initialize with last 6 months (including current)
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthKey = format(monthDate, 'MMM');
      newUsersByMonth.set(monthKey, new Set<string>());
      console.log(`Initialized month ${monthKey} for ${monthDate.toISOString()}`);
    }
    
    // Track each user's first registration date to count new signups
    const userFirstRegistration = new Map<string, Date>();
    
    // Find the first registration date for each user (only valid dates)
    allRegistrations.forEach(registration => {
      const userId = registration.userId;
      const regDate = safeParseDate(registration.registeredAt);
      
      if (!regDate) return; // Skip invalid dates
      
      if (!userFirstRegistration.has(userId) || regDate < userFirstRegistration.get(userId)!) {
        userFirstRegistration.set(userId, regDate);
      }
    });
    
    console.log('User first registrations found:', userFirstRegistration.size);
    
    // Count new users by month based on their first registration
    userFirstRegistration.forEach((firstRegDate, userId) => {
      console.log(`User ${userId} first registered on:`, firstRegDate.toISOString());
      
      // Only count if within last 6 months
      const sixMonthsAgo = subMonths(today, 6);
      console.log('Six months ago:', sixMonthsAgo.toISOString());
      
      if (firstRegDate >= sixMonthsAgo) {
        const monthKey = format(firstRegDate, 'MMM');
        console.log(`Adding user ${userId} to month ${monthKey}`);
        
        const monthSet = newUsersByMonth.get(monthKey);
        if (monthSet) {
          monthSet.add(userId);
          console.log(`Month ${monthKey} now has ${monthSet.size} users`);
        } else {
          console.log(`WARNING: Month ${monthKey} not found in map!`);
        }
      } else {
        console.log(`User ${userId} registration too old, skipping`);
      }
    });
    
    // Convert to chart format
    const signupsData = Array.from(newUsersByMonth).map(([name, userSet]) => ({
      name,
      value: userSet.size
    }));
    
    console.log('Final new users by month calculation:', signupsData);
    console.log('=== BUSINESS METRICS CALCULATION END ===');
    
    setNewSignupsOverTime(signupsData);
  };

  return {
    totalUniqueRunners,
    repeatRunnersPercentage,
    averageRunnersPerEvent,
    communityReturnRate,
    newSignupsOverTime
  };
};
