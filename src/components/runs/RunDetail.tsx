
import React from 'react';
import { RunEvent } from '@/types';
import RunHeroSection from './RunHeroSection';
import RunInfoGrid from './RunInfoGrid';
import RunLocationSection from './RunLocationSection';
import RunDescriptionSection from './RunDescriptionSection';
import RunHostSection from './RunHostSection';
import RunParticipantsSection from './RunParticipantsSection';
import RunWhatsAppSection from './RunWhatsAppSection';

interface RunDetailProps {
  run: RunEvent;
  refreshKey?: number; // Add refresh key prop
}

const RunDetail: React.FC<RunDetailProps> = ({ run, refreshKey = 0 }) => {
  return (
    <div className="space-y-6">
      {/* Hero section with image */}
      <RunHeroSection run={run} />
      
      {/* Run details */}
      <RunInfoGrid run={run} />
      
      {/* WhatsApp Group Section */}
      <RunWhatsAppSection run={run} />
      
      {/* Run location */}
      <RunLocationSection run={run} />
      
      {/* Run description */}
      <RunDescriptionSection run={run} />
      
      {/* Host info */}
      <RunHostSection run={run} />
      
      {/* Participants */}
      <RunParticipantsSection run={run} refreshKey={refreshKey} />
    </div>
  );
};

export default RunDetail;
