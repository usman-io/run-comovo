
import { RunEvent } from '@/types';
import { eventsApi } from '@/services/api';
import { transformXanoEvent } from '../dataTransforms';
import { eventsFetcher } from './eventsFetcher';
import { invalidateAllCaches } from '@/utils/cacheInvalidation';

export class EventsManager {
  async updateEvent(eventId: string, runEvent: Partial<RunEvent>): Promise<RunEvent> {
    try {
      console.log('EventsManager: Updating event in Xano:', eventId, runEvent);
      const updatedEvent = await eventsApi.updateEvent(parseInt(eventId), runEvent as any);
      
      const transformedEvent = transformXanoEvent(updatedEvent);
      
      // Invalidate all caches to ensure fresh data on all pages
      eventsFetcher.forceRefresh();
      invalidateAllCaches();
      
      console.log('EventsManager: Updated event and invalidated caches:', transformedEvent);
      return transformedEvent;
    } catch (error) {
      console.error('EventsManager: Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      console.log('EventsManager: Deleting event from Xano:', eventId);
      await eventsApi.deleteEvent(parseInt(eventId));
      
      // Invalidate all caches to ensure fresh data on all pages
      eventsFetcher.forceRefresh();
      invalidateAllCaches();
      
      console.log('EventsManager: Event deleted successfully and caches invalidated');
    } catch (error) {
      console.error('EventsManager: Error deleting event:', error);
      throw error;
    }
  }
}

export const eventsManager = new EventsManager();
