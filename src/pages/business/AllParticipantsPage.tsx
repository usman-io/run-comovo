
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBusinessData } from '@/hooks/useBusinessData';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { ChevronLeft, Download } from 'lucide-react';

const AllParticipantsPage = () => {
  const navigate = useNavigate();
  const { runParticipants, upcomingRuns, pastRuns, isLoading } = useBusinessData();
  
  // Create a lookup map for run titles
  const allRuns = [...upcomingRuns, ...pastRuns];
  const runTitleLookup = allRuns.reduce((acc, run) => {
    acc[run.id] = run.title;
    return acc;
  }, {} as { [runId: string]: string });
  
  // Flatten all participants from all runs with proper event names
  const allParticipants = Object.entries(runParticipants).flatMap(([runId, participants]) => {
    return participants.map(p => ({
      ...p,
      eventTitle: runTitleLookup[runId] || 'Unknown Event'
    }));
  });

  // Handle export as CSV
  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV
    if (allParticipants.length === 0) return;
    
    const headers = ['Name', 'Email', 'Event', 'Registration Date'];
    const rows = allParticipants.map(p => [
      p.userName,
      p.userEmail,
      p.eventTitle,
      p.registeredAt
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all-participants.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/business/home')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <h1 className="text-2xl font-bold">All Participants</h1>
            </div>
            
            <Button 
              onClick={handleExportCSV} 
              disabled={allParticipants.length === 0}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" /> Export as CSV
            </Button>
          </div>
          
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">Loading participants...</p>
            </div>
          ) : allParticipants.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.userName}</TableCell>
                      <TableCell>{participant.userEmail}</TableCell>
                      <TableCell>{participant.eventTitle}</TableCell>
                      <TableCell>{new Date(parseInt(participant.registeredAt)).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No participants found</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AllParticipantsPage;
