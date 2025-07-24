
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ParticipantsList from '@/components/runs/ParticipantsList';
import { useRunDetails } from '@/hooks/useRunDetails';
import { useQuery } from '@tanstack/react-query';
import { registrationService } from '@/services/registrationService';
import { ChevronLeft } from 'lucide-react';

const RunParticipantsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Get run details
  const { run, isLoading: runLoading } = useRunDetails(id);
  
  // Get participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['run-participants', id],
    queryFn: () => registrationService.getEventRegistrations(id!),
    enabled: !!id,
  });

  const handleExportCSV = () => {
    if (participants.length === 0 || !run) return;
    
    const headers = ['Name', 'Email', 'Pace', 'Registration Date'];
    const rows = participants.map(p => [
      p.userName,
      p.userEmail,
      `${p.userPace} min/km`,
      new Date(parseInt(p.registeredAt)).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${run.title}-participants.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          {runLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : run ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" asChild>
                  <Link to={`/runs/${id}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> 
                    Back to Run
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{run.title} - Participants</h1>
                  <p className="text-muted-foreground">
                    {new Date(run.date).toLocaleDateString()} at {run.time}
                  </p>
                </div>
              </div>
              
              {participantsLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading participants...</p>
                </div>
              ) : (
                <ParticipantsList
                  participants={participants}
                  runTitle={run.title}
                  onExportCSV={handleExportCSV}
                />
              )}
            </div>
          ) : (
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

export default RunParticipantsPage;
