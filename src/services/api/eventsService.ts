
import { BaseApiService, EVENTS_BASE_URL } from './baseApi';
import { XanoEvent } from './types';
import { RunEvent } from '@/types';
import { transformToXanoEvent } from '../dataTransforms';
import { fileUploadApi } from './fileUploadService';

class EventsApiService extends BaseApiService {
  async getEvents(): Promise<XanoEvent[]> {
    return this.request<XanoEvent[]>('/events');
  }

  async getEvent(eventId: number): Promise<XanoEvent> {
    return this.request<XanoEvent>(`/events/${eventId}`);
  }

  async createEvent(eventData: Omit<XanoEvent, 'id' | 'created_at'>): Promise<XanoEvent> {
    return this.request<XanoEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async createEventWithImage(
    runEvent: Partial<RunEvent>,
    businessId: number,
    latitude?: number,
    longitude?: number,
    imageFile?: File,
    businessName?: string
  ): Promise<XanoEvent> {
    console.log('=== EVENTS API SERVICE ===');
    console.log('API Service received runEvent.date:', runEvent.date);
    console.log('API Service received runEvent.time:', runEvent.time);
    console.log('API Service received businessName parameter:', businessName);
    console.log('API Service received runEvent.hostName:', runEvent.hostName);
    
    // CRITICAL FIX: Use the businessName parameter if provided, otherwise use runEvent.hostName
    const finalBusinessName = businessName || runEvent.hostName;
    console.log('API Service final business name to send:', finalBusinessName);
    
    console.log('Creating event with image:', { runEvent, businessId, latitude, longitude, hasImage: !!imageFile, finalBusinessName });
    
    // Transform run event to Xano format, now using the correct business name
    const xanoEventData = transformToXanoEvent(runEvent, businessId, latitude, longitude, finalBusinessName);
    
    console.log('=== AFTER TRANSFORM TO XANO ===');
    console.log('xanoEventData.event_start:', xanoEventData.event_start);
    console.log('xanoEventData.business_name:', xanoEventData.business_name);
    console.log('Creating event in Xano:', xanoEventData);
    
    try {
      // Create event in Xano first
      const createdEvent = await this.request<XanoEvent>('/events', {
        method: 'POST',
        body: JSON.stringify(xanoEventData),
      });

      console.log('Event created successfully in Xano:', createdEvent);
      
      // Upload image to Supabase Storage if provided
      if (imageFile) {
        try {
          console.log('Uploading image file to Supabase with event ID:', createdEvent.id);
          
          // Upload with event ID as filename
          const uploadResult = await fileUploadApi.uploadFile(imageFile, createdEvent.id.toString());
          console.log('Image uploaded successfully:', uploadResult);
        } catch (uploadError) {
          console.error('Supabase image upload failed:', uploadError);
          // Don't fail the entire operation if image upload fails
        }
      }
      
      return createdEvent;
    } catch (createError) {
      console.error('Event creation failed:', createError);
      console.log('Event data that failed:', xanoEventData);
      throw createError;
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
  ): Promise<XanoEvent> {
    console.log('=== EVENTS API SERVICE WITH BUSINESS INFO ===');
    console.log('Business info received:', { businessName, businessLatitude, businessLongitude });
    console.log('----------whatsappGroupLink:', runEvent.whatsappGroupLink);
    
    // Transform run event to Xano format with business info
    const xanoEventData = transformToXanoEvent(runEvent, businessId, latitude, longitude, businessName);
    
    // Add business location as geo_point if coordinates are available
    if (businessLatitude && businessLongitude) {
      (xanoEventData as any).business_location = `POINT(${businessLongitude} ${businessLatitude})`;
      console.log('Added business_location as geo_point:', `POINT(${businessLongitude} ${businessLatitude})`);
    }
    
    console.log('Final Xano event data with business info:', xanoEventData);
    
    try {
      // Create event in Xano first
      const createdEvent = await this.request<XanoEvent>('/events', {
        method: 'POST',
        body: JSON.stringify(xanoEventData),
      });

      console.log('Event created successfully with business info:', createdEvent);
      
      // Upload image to Supabase Storage if provided
      if (imageFile) {
        try {
          console.log('Uploading image file to Supabase with event ID:', createdEvent.id);
          
          // Upload with event ID as filename
          const uploadResult = await fileUploadApi.uploadFile(imageFile, createdEvent.id.toString());
          console.log('Image uploaded successfully:', uploadResult);
        } catch (uploadError) {
          console.error('Supabase image upload failed:', uploadError);
          // Don't fail the entire operation if image upload fails
        }
      }
      
      return createdEvent;
    } catch (createError) {
      console.error('Event creation with business info failed:', createError);
      throw createError;
    }
  }

  async updateEvent(eventId: number, eventData: Partial<XanoEvent>): Promise<XanoEvent> {
    return this.request<XanoEvent>(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: number): Promise<void> {
    return this.request<void>(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export const eventsApi = new EventsApiService();
