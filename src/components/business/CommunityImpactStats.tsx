
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CommunityImpactStatsProps {
  participantsThisMonth: number;
  totalRuns: number;
  upcomingRuns: number;
  totalParticipants: number;
}

const CommunityImpactStats: React.FC<CommunityImpactStatsProps> = ({
  participantsThisMonth,
  totalRuns,
  upcomingRuns,
  totalParticipants,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Your Community Impact</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{participantsThisMonth}</div>
            <p className="text-muted-foreground">Runners this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{totalRuns}</div>
            <p className="text-muted-foreground">Total runs organized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{upcomingRuns}</div>
            <p className="text-muted-foreground">Upcoming runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{totalParticipants}</div>
            <p className="text-muted-foreground">Total participants</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityImpactStats;
