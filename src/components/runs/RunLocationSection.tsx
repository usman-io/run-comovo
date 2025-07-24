
import React from 'react';
import { MapPin } from 'lucide-react';
import { RunEvent } from '@/types';

interface RunLocationSectionProps {
  run: RunEvent;
}

const RunLocationSection: React.FC<RunLocationSectionProps> = ({
  run
}) => {
  const openInGoogleMaps = () => {
    if (run.address) {
      const encodedAddress = encodeURIComponent(run.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Location</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        {/* Display text address */}
        {run.address && (
          <p className="text-sm text-muted-foreground mt-1">{run.address}</p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <button 
            onClick={openInGoogleMaps} 
            className="text-xs text-pacers-blue hover:underline flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            View on map
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunLocationSection;
