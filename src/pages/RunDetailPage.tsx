
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RunDetail from '@/components/runs/RunDetail';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useRunDetails } from '@/hooks/useRunDetails';
import { useRunRegistration } from '@/hooks/useRunRegistration';
import RunActionButtons from '@/components/runs/RunActionButtons';
import RunRegistrationDialog from '@/components/runs/RunRegistrationDialog';

const RunDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get run details with optimized caching
  const { run, isLoading } = useRunDetails(id);
  
  // Get registration functions
  const { 
    isUserRegistered, 
    isLoading: registrationLoading,
    handleOneClickRegister, 
    handleCancelRegistration 
  } = useRunRegistration(id);

  // Handle registration completion from form
  const handleRegistrationComplete = () => {
    setShowRegisterDialog(false);
    setRefreshKey(prev => prev + 1);
  };

  // Optimized registration handlers
  const handleRegisterWithRefresh = async () => {
    await handleOneClickRegister();
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelWithRefresh = async () => {
    await handleCancelRegistration();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          {isLoading ? (
            // Optimized loading state
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
              <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-100 w-2/3 rounded animate-pulse" />
              <div className="h-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : run ? (
            <div>
              <div className="mb-4">
                <Link to="/runs" className="text-pacers-blue hover:underline text-sm">
                  ← Back to all runs
                </Link>
              </div>
              
              <RunDetail run={run} refreshKey={refreshKey} />
              
              <RunActionButtons
                run={run}
                runId={id || ''}
                isUserRegistered={isUserRegistered}
                isLoading={registrationLoading}
                onRegister={handleRegisterWithRefresh}
                onCancelRegistration={handleCancelWithRefresh}
                onShowDialog={() => setShowRegisterDialog(true)}
              />
              
              {/* Registration Dialog */}
              <RunRegistrationDialog
                run={run}
                showDialog={showRegisterDialog}
                setShowDialog={setShowRegisterDialog}
                onRegistrationComplete={handleRegistrationComplete}
              />
            </div>
          ) : (
            // Not found
            <div className="text-center py-12">
              <p className="text-xl font-medium">Run not found</p>
              <p className="text-muted-foreground mt-2 mb-6">
                The run you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/runs">Browse All Runs</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RunDetailPage;
