
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/utils/helpers';
import { RunEvent, RunRegistration } from '@/types';
import { Users, Download, Edit, CalendarPlus, Trash2, Loader2 } from 'lucide-react';
import { runEventsService } from '@/services/runEventsService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RunsListingProps {
  runs: RunEvent[];
  isLoading: boolean;
  runParticipants: { [runId: string]: RunRegistration[] };
  onExportParticipants: (runId: string) => void;
  isPastRuns?: boolean;
  onRunDeleted?: (runId: string) => void;
}

const RunsListing: React.FC<RunsListingProps> = ({
  runs,
  isLoading,
  runParticipants,
  onExportParticipants,
  isPastRuns = false,
  onRunDeleted,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null);

  const handleDeleteRun = async (runId: string, runTitle: string, runHostId: string) => {
    // Prevent double-clicks by checking if already deleting
    if (deletingRunId === runId) {
      return;
    }

    // Authorization check - only run owner can delete their run
    if (!user || user.id !== runHostId) {
      toast({
        title: "Not authorized",
        description: "You can only delete runs that you created.",
        variant: "destructive",
      });
      return;
    }

    setDeletingRunId(runId);

    try {
      console.log('Deleting run:', runId);
      
      // Make the API call first
      await runEventsService.deleteEvent(runId);
      
      // If successful, remove from UI state
      if (onRunDeleted) {
        onRunDeleted(runId);
      }
      
      toast({
        title: "Run deleted successfully",
        description: `"${runTitle}" has been deleted.`,
      });

    } catch (error) {
      console.error('Error deleting run:', error);
      
      toast({
        title: "Error deleting run",
        description: "There was an error deleting the run. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingRunId(null);
    }
  };

  // Check if current user is the owner of a specific run
  const isRunOwner = (run: RunEvent) => {
    return user?.role === 'business' && user?.id === run.hostId;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium mb-2">No {isPastRuns ? 'past' : 'upcoming'} runs</p>
        <p className="text-muted-foreground mb-4">
          {isPastRuns 
            ? "You haven't hosted any runs yet."
            : "Ready to organize your first community run?"}
        </p>
        {!isPastRuns && (
          <Button asChild>
            <Link to="/business/create-run">Create New Run</Link>
          </Button>
        )}
      </div>
    );
  }

  // Sort runs chronologically with proper date+time handling
  const sortedRuns = [...runs].sort((a, b) => {
    // Create proper datetime objects by combining date and time
    const dateTimeA = new Date(`${a.date}T${a.time}:00`);
    const dateTimeB = new Date(`${b.date}T${b.time}:00`);
    
    if (isPastRuns) {
      // Most recent first for past runs
      return dateTimeB.getTime() - dateTimeA.getTime();
    } else {
      // Soonest first for upcoming runs
      return dateTimeA.getTime() - dateTimeB.getTime();
    }
  });

  return (
    <ScrollArea className="h-[240px]">
      <div className="space-y-3 pr-4">
        {sortedRuns.map(run => (
          <Card key={run.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex flex-col md:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <Link to={`/runs/${run.id}`} className="font-semibold text-base hover:text-pacers-blue">
                    {run.title}
                  </Link>
                   <p className="text-sm text-muted-foreground">
                     {formatDate(run.date)} • {run.time} • {run.distance}km • {run.address || run.location}
                   </p>
                  
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/runs/${run.id}`}>
                        <Users className="mr-2 h-4 w-4" />
                        {runParticipants[run.id]?.length || 0} Participants
                      </Link>
                    </Button>
                    {isPastRuns ? (
                      <Button size="sm" variant="secondary" asChild>
                        <Link to="/business/create-run">
                          <CalendarPlus className="mr-2 h-4 w-4" /> Duplicate
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/runs/${run.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExportParticipants(run.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  
                  {/* Only show delete button if user is the run owner */}
                  {isRunOwner(run) && (
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDeleteRun(run.id, run.title, run.hostId)}
                       disabled={deletingRunId === run.id}
                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                     >
                       {deletingRunId === run.id ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                       ) : (
                         <Trash2 className="h-4 w-4" />
                       )}
                     </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RunsListing;
