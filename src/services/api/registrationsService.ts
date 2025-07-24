
import { BaseApiService } from './baseApi';
import { XanoRegistration } from './types';

class RegistrationsApiService extends BaseApiService {
  async getAllRegistrations(): Promise<XanoRegistration[]> {
    return this.request<XanoRegistration[]>('/registrations');
  }

  async getRegistration(registrationId: number): Promise<XanoRegistration> {
    console.log('RegistrationsApiService.getRegistration: Fetching registration data for ID:', registrationId);
    const response = await this.request<XanoRegistration>(`/registrations/${registrationId}`);
    console.log('RegistrationsApiService.getRegistration: Response received:', response);
    return response;
  }

  async registerForEvent(eventId: number, runnerId: number): Promise<XanoRegistration> {
    return this.request<XanoRegistration>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, runner_id: runnerId }), // API expects event_id for creation
    });
  }

  async cancelRegistration(registrationId: number): Promise<void> {
    return this.request<void>(`/registrations/${registrationId}`, {
      method: 'DELETE',
    });
  }

  async getEventRegistrations(eventId: number): Promise<XanoRegistration[]> {
    // Get all registrations and filter by events_id (not event_id)
    const allRegistrations = await this.getAllRegistrations();
    return allRegistrations.filter(reg => reg.events_id === eventId);
  }

  async getUserRegistrations(userId: number): Promise<XanoRegistration[]> {
    // Get all registrations and filter by runner_id
    const allRegistrations = await this.getAllRegistrations();
    return allRegistrations.filter(reg => reg.runner_id === userId);
  }
}

export const registrationsApi = new RegistrationsApiService();
