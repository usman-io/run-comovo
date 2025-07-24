
import { supabase } from '@/integrations/supabase/client';

class FileUploadApiService {
  private bucketName = 'event-images';

  async uploadFile(file: File, eventId?: string): Promise<{ path: string; url: string }> {
    console.log('=== SUPABASE FILE UPLOAD START ===');
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    console.log('Event ID:', eventId);
    console.log('Bucket name:', this.bucketName);
    
    // Generate filename - use eventId if provided, otherwise generate unique name
    const fileExt = file.name.split('.').pop();
    const fileName = eventId ? `event-${eventId}.${fileExt}` : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `events/${fileName}`;
    
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
        throw new Error(`File upload failed: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from Supabase upload');
        throw new Error('File upload failed: No data returned');
      }

      // Get the public URL
      console.log('Getting public URL for path:', data.path);
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      console.log('Public URL data:', urlData);

      // Verify the file was actually uploaded by checking if it exists
      const fileExists = await this.checkFileExists(data.path);
      console.log('File exists after upload:', fileExists);

      const result = {
        path: data.path,
        url: urlData.publicUrl
      };

      console.log('=== SUPABASE FILE UPLOAD SUCCESS ===');
      console.log('Final result:', result);
      
      return result;
    } catch (error) {
      console.error('=== SUPABASE FILE UPLOAD FAILED ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  // Helper method to get public URL for existing file
  getPublicUrl(filePath: string): string {
    console.log('=== GETTING PUBLIC URL ===');
    console.log('Requested file path:', filePath);
    console.log('Bucket name:', this.bucketName);
    
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    console.log('Generated public URL:', data.publicUrl);
    return data.publicUrl;
  }

  // Enhanced method to construct image URL by event ID with better file detection
  async getEventImageUrl(eventId: string): Promise<string> {
    console.log('=== CONSTRUCTING EVENT IMAGE URL ===');
    console.log('Event ID:', eventId);
    
    // Try multiple possible file extensions
    const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    for (const ext of possibleExtensions) {
      const filePath = `events/event-${eventId}.${ext}`;
      console.log('Checking file path:', filePath);
      
      const exists = await this.checkFileExists(filePath);
      console.log(`File exists for ${ext}:`, exists);
      
      if (exists) {
        const url = this.getPublicUrl(filePath);
        console.log('=== FOUND EXISTING FILE ===');
        console.log('File path:', filePath);
        console.log('URL:', url);
        return url;
      }
    }
    
    console.log('=== NO FILE FOUND, USING FALLBACK ===');
    // Return fallback if no file found
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80';
  }

  // Synchronous version for immediate use (tries jpg first)
  getEventImageUrlSync(eventId: string): string {
    console.log('=== CONSTRUCTING EVENT IMAGE URL (SYNC) ===');
    console.log('Event ID:', eventId);
    
    // Default to jpg for immediate use
    const filePath = `events/event-${eventId}.jpg`;
    const url = this.getPublicUrl(filePath);
    console.log('Generated sync URL:', url);
    return url;
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
        .list('events', {
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
      
      if (exists) {
        console.log('Found file in bucket:', data.find(file => file.name === fileName));
      } else {
        console.log('Available files in bucket:', data.map(f => f.name));
      }
      
      return exists;
    } catch (error) {
      console.error('Exception checking file existence:', error);
      return false;
    }
  }

  // Method to list all files in the events folder (for debugging)
  async listAllEventFiles(): Promise<any[]> {
    console.log('=== LISTING ALL EVENT FILES ===');
    
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('events', {
          limit: 1000
        });

      console.log('All files in events folder:', data);
      
      if (error) {
        console.error('Error listing files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception listing files:', error);
      return [];
    }
  }
}

export const fileUploadApi = new FileUploadApiService();
