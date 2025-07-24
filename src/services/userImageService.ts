
import { supabase } from '@/integrations/supabase/client';

class UserImageService {
  private bucketName = 'user-images';

  async uploadProfileImage(file: File, userId: string): Promise<{ path: string; url: string }> {
    console.log('=== USER IMAGE UPLOAD START ===');
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    console.log('User ID:', userId);
    console.log('Bucket name:', this.bucketName);
    
    // Generate filename based on user ID
    const fileExt = file.name.split('.').pop();
    const fileName = `user-${userId}.${fileExt}`;
    const filePath = `profiles/${fileName}`;
    
    console.log('Generated file path:', filePath);
    
    try {
      // Upload to Supabase Storage
      console.log('Starting Supabase upload...');
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if file exists
        });

      console.log('Supabase upload response:', { data, error });

      if (error) {
        console.error('Supabase upload error details:', error);
        throw new Error(`Profile image upload failed: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from Supabase upload');
        throw new Error('Profile image upload failed: No data returned');
      }

      // Get the public URL
      console.log('Getting public URL for path:', data.path);
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      console.log('Public URL data:', urlData);

      const result = {
        path: data.path,
        url: urlData.publicUrl
      };

      console.log('=== USER IMAGE UPLOAD SUCCESS ===');
      console.log('Final result:', result);
      
      return result;
    } catch (error) {
      console.error('=== USER IMAGE UPLOAD FAILED ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  // Get public URL for existing profile image
  getProfileImageUrl(userId: string): string {
    console.log('=== GETTING PROFILE IMAGE URL ===');
    console.log('User ID:', userId);
    
    // Try multiple possible file extensions
    const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    // Default to jpg for immediate use
    const filePath = `profiles/user-${userId}.jpg`;
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    console.log('Generated profile image URL:', data.publicUrl);
    return data.publicUrl;
  }

  // Enhanced method to get profile image URL with better file detection
  async getProfileImageUrlAsync(userId: string): Promise<string> {
    console.log('=== GETTING PROFILE IMAGE URL (ASYNC) ===');
    console.log('User ID:', userId);
    
    // Try multiple possible file extensions
    const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    for (const ext of possibleExtensions) {
      const filePath = `profiles/user-${userId}.${ext}`;
      console.log('Checking file path:', filePath);
      
      const exists = await this.checkFileExists(filePath);
      console.log(`File exists for ${ext}:`, exists);
      
      if (exists) {
        const { data } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(filePath);
        
        console.log('=== FOUND EXISTING PROFILE IMAGE ===');
        console.log('File path:', filePath);
        console.log('URL:', data.publicUrl);
        return data.publicUrl;
      }
    }
    
    console.log('=== NO PROFILE IMAGE FOUND, USING DEFAULT ===');
    // Return empty string if no file found (will use default avatar)
    return '';
  }

  // Method to check if file exists
  async checkFileExists(filePath: string): Promise<boolean> {
    console.log('=== CHECKING FILE EXISTS ===');
    console.log('File path:', filePath);
    
    try {
      const fileName = filePath.split('/').pop();
      console.log('Looking for file name:', fileName);
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('profiles', {
          limit: 1000,
          search: fileName
        });

      console.log('File list response:', { data, error });
      
      if (error) {
        console.error('Error checking file existence:', error);
        return false;
      }

      const exists = data && data.some(file => file.name === fileName);
      console.log('File exists:', exists);
      
      return exists;
    } catch (error) {
      console.error('Exception checking file existence:', error);
      return false;
    }
  }
}

export const userImageService = new UserImageService();
