
import { RunEvent } from '@/types';
import { eventsApi } from '@/services/api';
import { transformXanoEvent } from '../dataTransforms';
import { eventsFetcher } from './eventsFetcher';
import { invalidateAllCaches } from '@/utils/cacheInvalidation';

export class EventsCreator {
  async createEvent(
    runEvent: Partial<RunEvent>, 
    businessId: number,
    latitude?: number,
    longitude?: number,
    imageFile?: File
  ): Promise<RunEvent> {
    try {
      console.log('=== EventsCreator: CREATE EVENT ===');
      console.log('Input runEvent.date:', runEvent.date);
      console.log('Input runEvent.time:', runEvent.time);
      console.log('Input runEvent.hostName:', runEvent.hostName);
      console.log('Creating event in Xano:', { runEvent, businessId, latitude, longitude, hasImage: !!imageFile });
      
      const businessName = runEvent.hostName && runEvent.hostName !== 'Unknown Business' ? runEvent.hostName : undefined;
      console.log('Extracted businessName for API:', businessName);
      
      const createdEvent = await eventsApi.createEventWithImage(runEvent, businessId, latitude, longitude, imageFile, businessName);
      
      const transformedEvent = transformXanoEvent(createdEvent);
      transformedEvent.hostId = businessId.toString();
      
      // Invalidate all caches to ensure fresh data on all pages
      eventsFetcher.forceRefresh();
      invalidateAllCaches();
      
      console.log('EventsCreator: Created event and invalidated cache:', transformedEvent);
      return transformedEvent;
    } catch (error) {
      console.error('EventsCreator: Error creating event:', error);
      throw error;
    }
  }

  async createEventWithBusinessInfo(
    runEvent: Partial<RunEvent>, 
    businessId: number,
    latitude?: number,
    longitude?: number,
    imageFile?: File,
    businessName?: string,
    businessLatitude?: number,
    businessLongitude?: number
  ): Promise<RunEvent> {
    try {
      console.log('=== EventsCreator: CREATE EVENT WITH BUSINESS INFO ===');
      console.log('Input runEvent:', runEvent);
      console.log('Business info:', { businessName, businessLatitude, businessLongitude });
      
      const createdEvent = await eventsApi.createEventWithBusinessInfo(
        runEvent, 
        businessId, 
        latitude, 
        longitude, 
        imageFile, 
        businessName,
        businessLatitude,
        businessLongitude
      );
      
      const transformedEvent = transformXanoEvent(createdEvent);
      transformedEvent.hostId = businessId.toString();
      
      // Invalidate all caches to ensure fresh data on all pages
      eventsFetcher.forceRefresh();
      invalidateAllCaches();
      
      console.log('EventsCreator: Created event with business info and invalidated cache:', transformedEvent);
      return transformedEvent;
    } catch (error) {
      console.error('EventsCreator: Error creating event with business info:', error);
      throw error;
    }
  }
}

export const eventsCreator = new EventsCreator();
