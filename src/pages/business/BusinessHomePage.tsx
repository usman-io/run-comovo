
import React, { useMemo, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import BusinessWelcomeHeader from '@/components/business/BusinessWelcomeHeader';
import BusinessProfileCard from '@/components/business/BusinessProfileCard';
import CreateRunCTA from '@/components/business/CreateRunCTA';
import RecentSignupsWidget from '@/components/business/RecentSignupsWidget';
import PromotionReminder from '@/components/business/PromotionReminder';
import RunManagementTabs from '@/components/business/RunManagementTabs';
import BusinessMetricsDashboard from '@/components/business/BusinessMetricsDashboard';
import { useBusinessData } from '@/hooks/useBusinessData';
import { useBusinessMetrics } from '@/hooks/useBusinessMetrics';
import { useLocation } from 'react-router-dom';

const BusinessHomePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { 
    isLoading, 
    upcomingRuns, 
    pastRuns, 
    runParticipants, 
    totalParticipants, 
    recentParticipants, 
    getTotalRunCount,
    refreshData,
    removeRunFromState
  } = useBusinessData();
  
  // Check if we're returning from creating a run and refresh data
  useEffect(() => {
    if (location.state?.runCreated) {
      console.log('Detected run creation, refreshing data...');
      // Just refresh the data instead of reloading the page
      refreshData();
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state, refreshData, location.pathname]);
  
  // Memoize business runs to prevent unnecessary recalculations
  const businessRuns = useMemo(() => [...upcomingRuns, ...pastRuns], [upcomingRuns, pastRuns]);
  
  // Memoize metrics calculation
  const businessMetrics = useBusinessMetrics(businessRuns, runParticipants, totalParticipants);
  
  // Handle export participants
  const handleExportParticipants = (runId: string) => {
    // In a real app, this would generate and download a CSV
    console.log('Exporting participants for run:', runId);
    alert('CSV download started (simulated)');
  };

  // Handle run deletion with immediate state update - DON'T refresh data
  const handleRunDeleted = (runId: string) => {
    console.log('Run deleted, updating state immediately...', runId);
    // Only remove from local state, don't refresh from server
    if (removeRunFromState) {
      removeRunFromState(runId);
    }
    // Don't call refreshData() here as it will restore the deleted run
  };

  // Get business name - only if user is business role and businessDetails exist
  const businessName = user?.role === 'business' && user?.businessDetails?.businessName 
    ? user.businessDetails.businessName 
    : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          {/* Business Profile Card - at the very top */}
          {user && <BusinessProfileCard user={user} />}
          
          {/* Header / Welcome */}
          <BusinessWelcomeHeader 
            businessName={businessName}
            totalRuns={getTotalRunCount()}
            totalParticipants={totalParticipants}
          />
          
          {/* Run Management Tabs - at the top */}
          <RunManagementTabs 
            isLoading={isLoading}
            upcomingRuns={upcomingRuns}
            pastRuns={pastRuns}
            runParticipants={runParticipants}
            onExportParticipants={handleExportParticipants}
            onRunDeleted={handleRunDeleted}
          />

          {/* Promotion Reminder - right below the RunManagementTabs */}
          <PromotionReminder />
          
          {/* Recent Participant Snapshot - now right after Promotion Reminder */}
          <div className="my-8">
            <RecentSignupsWidget 
              isLoading={isLoading} 
              recentParticipants={recentParticipants}
            />
          </div>

          {/* Business Metrics Dashboard */}
          <BusinessMetricsDashboard
            totalUniqueRunners={businessMetrics.totalUniqueRunners}
            repeatRunnersPercentage={businessMetrics.repeatRunnersPercentage}
            averageRunnersPerEvent={businessMetrics.averageRunnersPerEvent}
            communityReturnRate={businessMetrics.communityReturnRate}
            newSignupsOverTime={businessMetrics.newSignupsOverTime}
          />

          {/* Add more vertical space before the CreateRunCTA */}
          <div className="mt-16">
            {/* Create a Run CTA - moved further down with additional spacing */}
            <CreateRunCTA />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BusinessHomePage;
