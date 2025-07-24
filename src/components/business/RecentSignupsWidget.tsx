
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RunRegistration } from '@/types';
import { Users } from 'lucide-react';

interface RecentSignupsWidgetProps {
  isLoading: boolean;
  recentParticipants: RunRegistration[];
}

const RecentSignupsWidget: React.FC<RecentSignupsWidgetProps> = ({
  isLoading,
  recentParticipants,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Signups</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ) : recentParticipants.length > 0 ? (
          <ScrollArea className="h-24">
            <div className="space-y-2 text-sm pr-4">
              {recentParticipants.map(participant => (
                <div key={participant.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{participant.userName}</p>
                    <p className="text-muted-foreground text-xs">Run Registration</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(parseInt(participant.registeredAt)).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground">No participants yet.</p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" asChild className="w-full flex items-center justify-center">
          <Link to="/business/all-participants">
            <Users className="mr-2 h-4 w-4" /> View all participants
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentSignupsWidget;
