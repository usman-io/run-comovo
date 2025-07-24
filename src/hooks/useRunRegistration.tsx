
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { registrationService } from '@/services/registrationService';

export const useRunRegistration = (runId: string | undefined) => {
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Safely get user - might be null if not authenticated
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // useAuth throws error if not within AuthProvider - this is expected for unauthenticated users
    console.log('User not authenticated - this is normal for public run viewing');
  }

  // Check if user is already registered for this run
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (user && user.id && runId && !user.id.startsWith('temp-')) {
        try {
          console.log('Checking registration status for user:', user.id, 'run:', runId);
          setIsLoading(true);
          const registered = await registrationService.isUserRegistered(runId, user.id);
          console.log('Registration status result:', registered);
          setIsUserRegistered(registered);
        } catch (error) {
          console.error('Error checking registration status:', error);
          // Don't show error toast for checking status, just log it
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('Cannot check registration - missing user, runId, or user has temp ID:', { user: user?.id, runId });
      }
    };

    checkRegistrationStatus();
  }, [user, runId]);

  // Check if user profile is complete
  const isProfileComplete = (user: any) => {
    return user && user.name && user.email && user.role;
  };

  // Handle one-click registration for logged-in users
  const handleOneClickRegister = async () => {
    console.log('handleOneClickRegister called');
    console.log('User:', user);
    console.log('RunId:', runId);
    
    if (!user) {
      console.error('No user found for registration');
      toast.error('You must be logged in to register');
      return;
    }
    
    // Check for temporary user ID - this indicates authentication issues
    if (user.id.startsWith('temp-')) {
      console.error('User has temporary ID - authentication incomplete');
      toast.error('There was an issue with your account setup. Please log out and log back in.');
      return;
    }
    
    // Check if profile is complete
    if (!isProfileComplete(user)) {
      console.error('User profile incomplete');
      toast.error('Please complete your profile to register for runs. Go to your profile page to update your information.');
      return;
    }
    
    if (!runId) {
      console.error('Run ID not found');
      toast.error('Invalid run selected');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting to register user', user.id, 'for run', runId);
      
      // Normal registration flow for authenticated users with real IDs
      await registrationService.registerForEvent(runId, user.id);
      console.log('Registration successful - updating local state');
      
      // Immediately update local state to show registration
      setIsUserRegistered(true);
      
      toast.success('Successfully registered for the run!');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register for the run. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancellation of registration
  const handleCancelRegistration = async () => {
    console.log('handleCancelRegistration called');
    
    if (!user || !user.id || !runId) {
      console.error('Missing required data for cancellation');
      return;
    }
    
    if (user.id.startsWith('temp-')) {
      console.error('Cannot cancel registration for temporary user');
      toast.error('There was an issue with your account. Please log out and log back in.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting to cancel registration for user', user.id, 'run', runId);
      
      // Normal cancellation flow for authenticated users
      await registrationService.cancelRegistration(runId, user.id);
      console.log('Cancellation successful - updating local state');
      
      // Immediately update local state to show cancellation
      setIsUserRegistered(false);
      
      toast.success('Registration canceled successfully');
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isUserRegistered,
    isLoading,
    handleOneClickRegister,
    handleCancelRegistration
  };
};
