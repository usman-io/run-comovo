
import React from 'react';
import { formatDate, formatPace } from '@/utils/helpers';
import { RunEvent } from '@/types';

interface RunInfoGridProps {
  run: RunEvent;
}

const RunInfoGrid: React.FC<RunInfoGridProps> = ({ run }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
      <div>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="font-medium">{formatDate(run.date)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Time</p>
        <p className="font-medium">{run.time}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Distance</p>
        <p className="font-medium">{run.distance} km</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Pace</p>
        <p className="font-medium">{formatPace(run.pace)}</p>
      </div>
    </div>
  );
};

export default RunInfoGrid;
