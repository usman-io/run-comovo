
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RunRegistrationButtonProps {
  runId: string;
  isUserRegistered: boolean;
  isLoading?: boolean;
  onRegister: () => Promise<void>;
  onCancelRegistration: () => Promise<void>;
  onShowDialog: () => void;
}

const RunRegistrationButton: React.FC<RunRegistrationButtonProps> = ({
  runId,
  isUserRegistered,
  isLoading = false,
  onRegister,
  onCancelRegistration,
  onShowDialog,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    console.log('Register button clicked');
    console.log('User state:', user);
    
    if (!user) {
      console.log('No user - redirecting to login');
      toast.info('Please log in to register for runs');
      navigate('/login', { state: { redirectTo: `/runs/${runId}`, role: 'runner' } });
      return;
    }
    
    if (user.role !== 'runner') {
      console.log('User is not a runner:', user.role);
      toast.error('Only runner accounts can register for runs');
      return;
    }

    // For logged-in users with complete profiles, register immediately
    if (user.id) {
      console.log('User has ID, proceeding with registration');
      onRegister();
    } else {
      console.log('User missing ID, showing dialog for profile completion');
      // For users without complete profiles, show form
      onShowDialog();
    }
  };

  return (
    <>
      {!isUserRegistered ? (
        <Button 
          className="rounded-full px-8"
          onClick={handleRegisterClick}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register for this Run'}
        </Button>
      ) : (
        <div className="flex">
          <Button variant="outline" className="rounded-l-full px-8 border-green-500 text-green-600 hover:bg-green-50">
            You're Registered! ✓
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancelRegistration}
            disabled={isLoading}
            className="rounded-r-full border-red-300 text-red-600 hover:bg-red-50"
          >
            {isLoading ? 'Canceling...' : 'Cancel'}
          </Button>
        </div>
      )}
    </>
  );
};

export default RunRegistrationButton;
