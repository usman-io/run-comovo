
import { RunEvent } from '@/types';
import { eventsFetcher } from './runEvents/eventsFetcher';
import { eventsCreator } from './runEvents/eventsCreator';
import { eventsManager } from './runEvents/eventsManager';
import { eventsEnhancer } from './runEvents/eventsEnhancer';
import { transformXanoEvent } from './dataTransforms';
import { eventsApi } from './api';

export const runEventsService = {
  // Get all events
  getAllEvents: eventsFetcher.getAllEvents.bind(eventsFetcher),

  // Get single event by ID with enhanced business info
  getEvent: async (eventId: string): Promise<RunEvent | null> => {
    try {
      console.log('🔄 RunEventsService: Fetching single event:', eventId);
      
      // First try to get from the eventsFetcher cache
      const cachedEvents = await eventsFetcher.getAllEvents();
      const cachedEvent = cachedEvents.find(event => event.id === eventId);
      
      if (cachedEvent) {
        console.log('✅ RunEventsService: Found event in eventsFetcher cache');
        return cachedEvent;
      }
      
      // If not in cache, fetch from API
      console.log('🔄 RunEventsService: Event not in cache, fetching from Xano...');
      const xanoEvent = await eventsApi.getEvent(parseInt(eventId));
      const transformedEvent = transformXanoEvent(xanoEvent);
      
      // Enhance with business details
      const enhancedEvent = await eventsEnhancer.enhanceEventWithBusinessInfo(transformedEvent, xanoEvent);
      
      console.log('✅ RunEventsService: Final event with business details:', enhancedEvent);
      return enhancedEvent;
    } catch (error) {
      console.error('❌ RunEventsService: Error fetching event:', error);
      return null;
    }
  },

  // Create new event with optional image upload
  createEvent: eventsCreator.createEvent.bind(eventsCreator),

  // Create new event with business info
  createEventWithBusinessInfo: eventsCreator.createEventWithBusinessInfo.bind(eventsCreator),

  // Update event
  updateEvent: eventsManager.updateEvent.bind(eventsManager),

  // Delete event
  deleteEvent: eventsManager.deleteEvent.bind(eventsManager),

  // Get events for specific business
  getBusinessEvents: eventsFetcher.getBusinessEvents.bind(eventsFetcher),
};
