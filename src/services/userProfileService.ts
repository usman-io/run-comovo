
import { usersApi } from '@/services/api';
import { transformXanoUser } from './dataTransforms';
import { User, UserRole } from '@/contexts/auth/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  businessDetails?: {
    businessName: string;
    businessLocation: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  instagram?: string;
  businessPhone?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  google_review?: string;
  businessDescription?: string;
  role?: UserRole;
  profileImageUrl?: string;
}

export const userProfileService = {
  // Get current user profile
  getCurrentProfile: async (): Promise<User> => {
    try {
      console.log('userProfileService.getCurrentProfile: Starting fetch...');
      const xanoUser = await usersApi.getCurrentUser();
      console.log('userProfileService.getCurrentProfile: Raw Xano user received:', xanoUser);
      
      const transformedUser = transformXanoUser(xanoUser);
      console.log('userProfileService.getCurrentProfile: Transformed user:', transformedUser);
      console.log('userProfileService.getCurrentProfile: Business details after transform:', transformedUser.businessDetails);
      
      return transformedUser;
    } catch (error) {
      console.error('userProfileService.getCurrentProfile: Error fetching user profile:', error);
      throw new Error('Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (userId: string, profileData: UpdateProfileData): Promise<User> => {
    try {
      const updateData: any = {};
      
      if (profileData.name) updateData.name = profileData.name;
      if (profileData.email) updateData.email = profileData.email;
      if (profileData.profileImageUrl) updateData.profile_image_url = profileData.profileImageUrl;
      
      // ALWAYS include role - this is required by the API
      if (profileData.role) {
        updateData.role = profileData.role;
      } else {
        // Default to 'business' if we have business details, otherwise 'runner'
        updateData.role = profileData.businessDetails ? 'business' : 'runner';
      }
      
      // Handle business details for business users
      if (profileData.businessDetails) {
        updateData.business_name = profileData.businessDetails.businessName;
        
        // Include address field
        if (profileData.businessDetails.address) {
          updateData.address = profileData.businessDetails.address;
        }
        
        // Handle location as GeoPoint object like events do
        if (profileData.businessDetails.businessLocation) {
          if (profileData.businessDetails.latitude && profileData.businessDetails.longitude) {
            // Store as GeoPoint object
            updateData.business_location = {
              type: "point",
              data: {
                lat: profileData.businessDetails.latitude,
                lng: profileData.businessDetails.longitude
              }
            };
          } else {
            // If no coordinates provided, store as string (will be geocoded later)
            updateData.business_location = profileData.businessDetails.businessLocation;
          }
        }
      }
      
      // Handle social media links and business details separately
      if (profileData.businessPhone) {
        updateData.business_phone = profileData.businessPhone;
      }
      if (profileData.businessDescription) {
        updateData.business_description = profileData.businessDescription;
      }
      if (profileData.instagram) {
        updateData.instagram = profileData.instagram;
      }
      if (profileData.website) {
        updateData.website = profileData.website;
      }
      if (profileData.facebook) {
        updateData.facebook = profileData.facebook;
      }
      if (profileData.twitter) {
        updateData.twitter = profileData.twitter;
      }
      if (profileData.linkedin) {
        updateData.linkedin = profileData.linkedin;
      }
      if (profileData.google_review) {
        updateData.google_review = profileData.google_review;
      }

      console.log('Updating user profile with data:', updateData);
      console.log('Role being sent:', updateData.role);
      
      // Convert string userId to number for the API call
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID provided');
      }
      
      const updatedUser = await usersApi.updateUser(numericUserId, updateData);
      return transformXanoUser(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }
};
