
import React, { useRef, useState, useEffect } from 'react';
import { User, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { userImageService } from '@/services/userImageService';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ 
  currentImageUrl, 
  className = "w-24 h-24" 
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile image from Supabase on component mount
  useEffect(() => {
    const loadExistingImage = async () => {
      if (!user?.id) return;
      
      try {
        const existingImageUrl = await userImageService.getProfileImageUrlAsync(user.id);
        if (existingImageUrl) {
          setImageUrl(existingImageUrl);
        }
      } catch (error) {
        console.log('No existing profile image found, using default');
      }
    };
    
    if (!currentImageUrl) {
      loadExistingImage();
    }
  }, [user?.id, currentImageUrl]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting profile image upload to Supabase...');
      
      // Upload image to Supabase Storage only
      const { url } = await userImageService.uploadProfileImage(file, user.id);
      
      console.log('Profile image uploaded successfully to Supabase:', url);
      
      // Update local state only - no API calls to Xano
      setImageUrl(url);
      
      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to update profile image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group">
      <div 
        className={`${className} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden`}
        onClick={handleImageClick}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-12 h-12 text-white" />
        )}
        
        {/* Overlay for upload indication */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {!isUploading && (
        <p className="text-xs text-gray-500 mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Click to change
        </p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
