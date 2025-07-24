
import { registrationsApi, usersApi } from './api';
import { RunRegistration } from '@/types';

export const registrationService = {
  // Check if user is registered for a specific event
  isUserRegistered: async (eventId: string, userId: string): Promise<boolean> => {
    try {
      console.log('Checking registration status for event:', eventId, 'user:', userId);
      
      const userRegistrations = await registrationsApi.getUserRegistrations(parseInt(userId));
      console.log('User registrations from API:', userRegistrations);
      
      // Check if this user is registered for this event - using events_id field
      const isRegistered = userRegistrations.some(reg => {
        console.log('Comparing registration events_id:', reg.events_id, 'with target eventId:', eventId);
        return reg.events_id && reg.events_id.toString() === eventId;
      });
      
      console.log('User registration status for event', eventId, ':', isRegistered);
      return isRegistered;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  },

  // Register user for an event
  registerForEvent: async (eventId: string, userId: string): Promise<void> => {
    try {
      console.log('Registering user for event:', eventId, 'user:', userId);
      const result = await registrationsApi.registerForEvent(parseInt(eventId), parseInt(userId));
      console.log('Registration API response:', result);
      console.log('Registration successful');
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  // Cancel user registration for an event - cancel ALL registrations for this user/event combo
  cancelRegistration: async (eventId: string, userId: string): Promise<void> => {
    try {
      console.log('Canceling registration for event:', eventId, 'user:', userId);
      
      // Get user's registrations to find all for this event
      const userRegistrations = await registrationsApi.getUserRegistrations(parseInt(userId));
      console.log('Found user registrations for cancellation:', userRegistrations);
      
      // Find ALL registrations for this event (in case there are duplicates)
      const registrationsToCancel = userRegistrations.filter(reg => {
        console.log('Checking registration for cancellation - events_id:', reg.events_id, 'target:', eventId);
        return reg.events_id && reg.events_id.toString() === eventId;
      });
      
      if (registrationsToCancel.length > 0) {
        console.log('Found registrations to cancel:', registrationsToCancel);
        
        // Cancel all registrations for this event
        for (const registration of registrationsToCancel) {
          console.log('Canceling registration ID:', registration.id);
          await registrationsApi.cancelRegistration(registration.id);
        }
        
        console.log('All registrations canceled successfully');
      } else {
        console.error('No registrations found for cancellation');
        throw new Error('Registration not found');
      }
    } catch (error) {
      console.error('Error canceling registration:', error);
      throw error;
    }
  },

  // Get user's registrations
  getUserRegistrations: async (userId: string): Promise<RunRegistration[]> => {
    try {
      console.log('Fetching user registrations for userId:', userId);
      
      const userRegistrations = await registrationsApi.getUserRegistrations(parseInt(userId));
      console.log('User registrations from API:', userRegistrations);
      
      // Transform registrations using the individual endpoint to get proper user data
      const registrationsWithUserData: RunRegistration[] = [];
      
      for (const reg of userRegistrations) {
        try {
          // Fetch individual registration data to get proper user info
          const detailedReg = await registrationsApi.getRegistration(reg.id);
          console.log('Detailed registration data:', detailedReg);
          
          // Extract user data from nested user object only
          const userName = detailedReg.user?.name || `User ${detailedReg.runner_id}`;
          const userEmail = detailedReg.user?.email || '';
          
          registrationsWithUserData.push({
            id: detailedReg.id.toString(),
            runId: detailedReg.events_id.toString(),
            userId: userId,
            userName,
            userEmail,
            userPace: 6.0, // Default or could be fetched from user profile
            registeredAt: detailedReg.created_at.toString(),
            status: 'confirmed' as const,
          });
        } catch (error) {
          console.error('Error fetching detailed registration:', error);
          // Fallback to basic data if detailed fetch fails
          registrationsWithUserData.push({
            id: reg.id.toString(),
            runId: reg.events_id.toString(),
            userId: userId,
            userName: `User ${reg.runner_id}`,
            userEmail: '',
            userPace: 6.0,
            registeredAt: reg.created_at.toString(),
            status: 'confirmed' as const,
          });
        }
      }

      console.log('Transformed user registrations with detailed user data:', registrationsWithUserData);
      return registrationsWithUserData;
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      return [];
    }
  },

  // Get all registrations for an event with actual user data using individual endpoint
  getEventRegistrations: async (eventId: string): Promise<RunRegistration[]> => {
    try {
      console.log('Fetching registrations for event:', eventId);
      
      const eventRegistrations = await registrationsApi.getEventRegistrations(parseInt(eventId));
      console.log('Event registrations from API:', eventRegistrations);
      
      // Transform registrations using the individual endpoint to get proper user data
      const registrationsWithUserData: RunRegistration[] = [];
      
      for (const reg of eventRegistrations) {
        try {
          // Fetch individual registration data to get proper user info
          const detailedReg = await registrationsApi.getRegistration(reg.id);
          console.log('Detailed registration data for event registration:', detailedReg);
          
          // Extract user data from nested user object only
          const userName = detailedReg.user?.name || `User ${detailedReg.runner_id}`;
          const userEmail = detailedReg.user?.email || '';
          
          registrationsWithUserData.push({
            id: detailedReg.id.toString(),
            runId: eventId,
            userId: detailedReg.runner_id.toString(),
            userName,
            userEmail,
            userPace: 6.0, // Default or could be fetched from user profile
            registeredAt: detailedReg.created_at.toString(),
            status: 'confirmed' as const,
          });
        } catch (error) {
          console.error('Error fetching detailed registration:', error);
          // Fallback to basic data if detailed fetch fails
          registrationsWithUserData.push({
            id: reg.id.toString(),
            runId: eventId,
            userId: reg.runner_id.toString(),
            userName: `User ${reg.runner_id}`,
            userEmail: '',
            userPace: 6.0,
            registeredAt: reg.created_at.toString(),
            status: 'confirmed' as const,
          });
        }
      }

      console.log('Event registrations with detailed user data:', registrationsWithUserData);
      return registrationsWithUserData;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      return [];
    }
  },
};
