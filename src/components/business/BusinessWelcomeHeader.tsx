
import React from 'react';

interface BusinessWelcomeHeaderProps {
  businessName?: string;
  totalRuns: number;
  totalParticipants: number;
}

const BusinessWelcomeHeader: React.FC<BusinessWelcomeHeaderProps> = ({
  businessName,
  totalRuns,
  totalParticipants,
}) => {
  // Fallback to a generic greeting if no business name is available
  const displayName = businessName || "Your Business";
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
      <p className="text-muted-foreground mt-2">
        {totalRuns} runs organized • {totalParticipants} total participants
      </p>
    </div>
  );
};

export default BusinessWelcomeHeader;
