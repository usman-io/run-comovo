
import { RunEvent } from '@/types';
import { eventsApi } from '@/services/api';
import { transformXanoEvent } from '../dataTransforms';

export class EventsFetcher {
  private eventCache = new Map<string, { data: RunEvent[]; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // Increased to 10 minutes
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    return now - this.lastRequestTime >= this.MIN_REQUEST_INTERVAL;
  }

  async getAllEvents(): Promise<RunEvent[]> {
    try {
      // Check cache first - always prefer cached data if valid
      const cached = this.eventCache.get('all-events');
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('✅ EventsFetcher: Using cached events (valid cache)');
        return cached.data;
      }

      // If we can't make a request due to rate limiting, return stale cache if available
      if (!this.canMakeRequest()) {
        if (cached) {
          console.log('⚠️ EventsFetcher: Rate limited, using stale cached data');
          return cached.data;
        } else {
          console.log('⚠️ EventsFetcher: Rate limited and no cache available, returning empty array');
          return [];
        }
      }

      console.log('🔄 EventsFetcher: Fetching fresh events from API...');
      const startTime = performance.now();
      
      this.lastRequestTime = Date.now();
      const xanoEvents = await eventsApi.getEvents();
      const fetchTime = performance.now() - startTime;
      
      console.log(`✅ EventsFetcher: API responded in ${fetchTime.toFixed(2)}ms with ${xanoEvents.length} events`);
      
      if (xanoEvents.length === 0) {
        console.warn('⚠️ EventsFetcher: No events returned from API');
        // Return cached data if API returns empty but we have cache
        if (cached) {
          console.log('⚠️ EventsFetcher: API returned empty, using cached data instead');
          return cached.data;
        }
        return [];
      }
      
      // Transform events in batches for better performance
      const transformedEvents = xanoEvents.map(event => transformXanoEvent(event));
      
      // Cache the results with extended duration
      this.eventCache.set('all-events', {
        data: transformedEvents,
        timestamp: Date.now()
      });
      
      console.log(`✅ EventsFetcher: Successfully transformed and cached ${transformedEvents.length} events`);
      return transformedEvents;
    } catch (error) {
      console.error('❌ EventsFetcher: Error fetching events:', error);
      
      // Return cached data if available, even if stale
      const cached = this.eventCache.get('all-events');
      if (cached) {
        console.log('⚠️ EventsFetcher: Returning stale cached data due to error');
        return cached.data;
      }
      
      // Return empty array as last resort
      return [];
    }
  }

  async getEvent(eventId: string): Promise<RunEvent | null> {
    try {
      // First try to get from the cached events list
      const cached = this.eventCache.get('all-events');
      if (cached && this.isCacheValid(cached.timestamp)) {
        const event = cached.data.find(e => e.id === eventId);
        if (event) {
          console.log('✅ EventsFetcher: Found event in cache');
          return event;
        }
      }

      // Rate limit protection for single event requests too
      if (!this.canMakeRequest()) {
        console.log('⚠️ EventsFetcher: Rate limited for single event request');
        if (cached) {
          const event = cached.data.find(e => e.id === eventId);
          return event || null;
        }
        return null;
      }

      console.log('🔄 EventsFetcher: Fetching single event:', eventId);
      
      this.lastRequestTime = Date.now();
      const xanoEvent = await eventsApi.getEvent(parseInt(eventId));
      return transformXanoEvent(xanoEvent);
    } catch (error) {
      console.error('❌ EventsFetcher: Error fetching event:', error);
      
      // Try to get from cache as fallback
      const cached = this.eventCache.get('all-events');
      if (cached) {
        const event = cached.data.find(e => e.id === eventId);
        return event || null;
      }
      
      return null;
    }
  }

  async getBusinessEvents(businessId: string): Promise<RunEvent[]> {
    try {
      console.log('🔄 EventsFetcher: Fetching business events for:', businessId);
      
      // Try to get from cache first to avoid API call
      const allEvents = await this.getAllEvents();
      const businessEvents = allEvents.filter(event => event.hostId === businessId);
      
      console.log(`✅ EventsFetcher: Found ${businessEvents.length} events for business ${businessId}`);
      return businessEvents;
    } catch (error) {
      console.error('❌ EventsFetcher: Error fetching business events:', error);
      return [];
    }
  }

  // Force refresh cache when needed (e.g., after creating new event)
  forceRefresh(): void {
    this.eventCache.clear();
    this.lastRequestTime = 0;
    console.log('🗑️ EventsFetcher: Cache cleared, ready for fresh data');
  }

  // Clear cache when needed
  clearCache(): void {
    this.eventCache.clear();
    console.log('🗑️ EventsFetcher: Cache cleared');
  }
}

export const eventsFetcher = new EventsFetcher();
