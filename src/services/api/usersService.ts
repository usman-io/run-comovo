
import { BaseApiService, AUTH_BASE_URL, EVENTS_BASE_URL } from './baseApi';
import { XanoUser } from './types';

class UsersApiService extends BaseApiService {
  async getCurrentUser(): Promise<XanoUser> {
    console.log('UsersApiService.getCurrentUser: Fetching current user data...');
    try {
      const response = await this.request<XanoUser>('/auth/me', {
        method: 'GET',
      }, AUTH_BASE_URL);
      
      console.log('UsersApiService.getCurrentUser: Raw API response:', response);
      console.log('UsersApiService.getCurrentUser: Response type:', typeof response);
      console.log('UsersApiService.getCurrentUser: Response keys:', Object.keys(response || {}));
      console.log('UsersApiService.getCurrentUser: Detailed business fields check:', {
        'response.business_name': response?.business_name,
        'response.business_description': response?.business_description,
        'response.business_phone': response?.business_phone,
        'response.address': response?.address,
        'response.website': response?.website,
        'response.instagram': response?.instagram,
        'response.facebook': response?.facebook,
        'response.twitter': response?.twitter,
        'response.linkedin': response?.linkedin,
        'response.google_review': response?.google_review,
        'typeof business_name': typeof response?.business_name,
        'typeof business_description': typeof response?.business_description
      });
      
      return response;
    } catch (error) {
      console.error('UsersApiService.getCurrentUser: Error fetching user:', error);
      throw error;
    }
  }

  async getUser(userId: number): Promise<XanoUser> {
    console.log('UsersApiService.getUser: Fetching user data for ID:', userId);
    
    try {
      const response = await this.request<XanoUser>(`/user/${userId}`, {
        method: 'GET',
      }, EVENTS_BASE_URL);
      
      console.log('UsersApiService.getUser: Raw API response:', JSON.stringify(response, null, 2));
      console.log('UsersApiService.getUser: Business-related fields in response:');
      console.log('- business_name:', response.business_name);
      console.log('- business_location:', response.business_location);
      console.log('- business_phone:', response.business_phone);
      console.log('- business_description:', response.business_description);
      console.log('- address:', response.address);
      console.log('- business_type:', response.business_type);
      console.log('- website:', response.website);
      console.log('- instagram:', response.instagram);
      console.log('- facebook:', response.facebook);
      console.log('- twitter:', response.twitter);
      console.log('- linkedin:', response.linkedin);
      console.log('- google_review:', response.google_review);
      
      return response;
    } catch (error) {
      console.error('UsersApiService.getUser: Failed for user ID:', userId, error);
      console.log('UsersApiService.getUser: FALLING BACK TO MINIMAL USER OBJECT');
      // Return fallback with required properties
      return {
        id: userId,
        created_at: Date.now(),
        name: `User ${userId}`,
        email: '',
        role: 'runner'
      };
    }
  }

  async updateUser(userId: number, userData: Partial<XanoUser>): Promise<XanoUser> {
    console.log('UsersApiService.updateUser: Updating user data for ID:', userId, 'Data:', userData);
    return this.request<XanoUser>(`/user/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }, EVENTS_BASE_URL);
  }

  async getUserByVerificationToken(token: string): Promise<XanoUser | null> {
    console.log('UsersApiService.getUserByVerificationToken: Looking up user by token');
    try {
      // Get all users and find the one with matching verification token
      // Note: This is not ideal for production, but works for the current setup
      const response = await this.request<XanoUser[]>('/user', {
        method: 'GET',
      }, EVENTS_BASE_URL);
      
      const user = response.find(u => u.verification_token === token);
      console.log('UsersApiService.getUserByVerificationToken: Found user:', user?.id || 'none');
      return user || null;
    } catch (error) {
      console.error('UsersApiService.getUserByVerificationToken: Error:', error);
      return null;
    }
  }
}

export const usersApi = new UsersApiService();
