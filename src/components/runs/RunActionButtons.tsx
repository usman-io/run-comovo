
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import RunRegistrationButton from './RunRegistrationButton';
import ShareButton from './ShareButton';
import { RunEvent } from '@/types';

interface RunActionButtonsProps {
  run: RunEvent;
  runId: string;
  isUserRegistered: boolean;
  isLoading?: boolean;
  onRegister: () => Promise<void>;
  onCancelRegistration: () => Promise<void>;
  onShowDialog: () => void;
}

const RunActionButtons: React.FC<RunActionButtonsProps> = ({
  run,
  runId,
  isUserRegistered,
  isLoading = false,
  onRegister,
  onCancelRegistration,
  onShowDialog,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 sticky bottom-6 flex justify-center items-end gap-4">
      {/* Main registration button - larger and prominent */}
      <div className="bg-white rounded-full shadow-lg">
        <RunRegistrationButton
          runId={runId}
          isUserRegistered={isUserRegistered}
          isLoading={isLoading}
          onRegister={onRegister}
          onCancelRegistration={onCancelRegistration}
          onShowDialog={onShowDialog}
        />
      </div>
      
      {/* Share button - smaller, independent */}
      <div className="bg-white rounded-full shadow-lg">
        <ShareButton run={run} />
      </div>
      
      {/* Scroll to top button - smaller, independent */}
      <div className="bg-white rounded-full shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollToTop}
          className="rounded-full"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RunActionButtons;
