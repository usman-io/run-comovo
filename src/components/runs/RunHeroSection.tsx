
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { RunEvent } from '@/types';
import { fileUploadApi } from '@/services/api/fileUploadService';

interface RunHeroSectionProps {
  run: RunEvent;
}

const RunHeroSection: React.FC<RunHeroSectionProps> = ({ run }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);

  // Get the display name for the host
  const getHostDisplayName = () => {
    if (run.hostContactInfo?.businessName) {
      return run.hostContactInfo.businessName;
    }
    if (run.hostName && run.hostName !== 'Business Host') {
      return run.hostName;
    }
    return 'Business Host';
  };

  // Load image URL on component mount
  useEffect(() => {
    const loadImageUrl = async () => {
      console.log('=== RUNHEROSECTION IMAGE URL LOGIC ===');
      console.log('Run ID:', run.id);
      console.log('Run imageUrl:', run.imageUrl);
      console.log('Run ID is numeric:', !isNaN(parseInt(run.id)));
      
      setImageLoading(true);
      
      // If we have a direct image URL, use it
      if (run.imageUrl && run.imageUrl !== '' && run.imageUrl.startsWith('http')) {
        console.log('Using provided imageUrl:', run.imageUrl);
        setImageUrl(run.imageUrl);
        setImageLoading(false);
        return;
      }

      // For Xano events (numeric IDs), check Supabase
      if (!isNaN(parseInt(run.id))) {
        console.log('Checking Supabase for event:', run.id);
        
        // First, list all files to see what's available
        const allFiles = await fileUploadApi.listAllEventFiles();
        console.log('All available files:', allFiles);
        
        // Try to find the specific file
        const supabaseUrl = await fileUploadApi.getEventImageUrl(run.id);
        console.log('Supabase URL result:', supabaseUrl);
        
        setImageUrl(supabaseUrl);
        setImageLoading(false);
        return;
      }

      // Default fallback
      console.log('Using fallback image');
      const fallbackUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80';
      setImageUrl(fallbackUrl);
      setImageLoading(false);
    };

    loadImageUrl();
  }, [run.id, run.imageUrl]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('=== IMAGE ERROR IN RUNHEROSECTION ===');
    console.log('Failed URL:', target.src);
    console.log('Event ID:', run.id);
    console.log('Original imageUrl:', run.imageUrl);

    // Use a reliable running image from Unsplash
    const fallbackUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80';
    console.log('Setting fallback URL:', fallbackUrl);
    if (target.src !== fallbackUrl) {
      target.src = fallbackUrl;
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('=== IMAGE LOADED SUCCESSFULLY IN RUNHEROSECTION ===');
    console.log('Loaded URL:', target.src);
    console.log('Event ID:', run.id);
    setImageLoading(false);
  };

  console.log('=== FINAL IMAGE URL FOR RUNHEROSECTION ===');
  console.log('Final URL:', imageUrl);

  return (
    <AspectRatio ratio={3 / 4} className="relative rounded-lg overflow-hidden">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading image...</div>
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={run.title} 
        className="w-full h-full object-cover" 
        onError={handleImageError} 
        onLoad={handleImageLoad} 
        loading="eager"
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 px-[24px]">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{run.title}</h1>
        <p className="text-white/80">Hosted by {getHostDisplayName()}</p>
      </div>
    </AspectRatio>
  );
};

export default RunHeroSection;
