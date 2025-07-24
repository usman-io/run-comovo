
import { RunEvent } from '@/types';
import { usersApi } from '@/services/api';

export class EventsEnhancer {
  async enhanceEventWithBusinessInfo(event: RunEvent, xanoEvent: any): Promise<RunEvent> {
    try {
      console.log('🔄 EventsEnhancer: Fetching business details for event...');
      
      const currentUser = await usersApi.getCurrentUser();
      
      if (currentUser && currentUser.id === xanoEvent.business_id && currentUser.role === 'business') {
        console.log('✅ EventsEnhancer: Found business user details:', currentUser);
        
        if (event.hostContactInfo) {
          if (currentUser.business_phone) {
            event.hostContactInfo.phone = currentUser.business_phone;
          }
          event.hostContactInfo.email = currentUser.email;
        }
      }
    } catch (businessError) {
      console.log('⚠️ EventsEnhancer: Could not fetch additional business details:', businessError);
    }
    
    return event;
  }
}

export const eventsEnhancer = new EventsEnhancer();
