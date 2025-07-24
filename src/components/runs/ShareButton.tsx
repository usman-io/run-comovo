import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { RunEvent } from '@/types';
import { toast } from 'sonner';
import { formatPace } from '@/utils/helpers';

interface ShareButtonProps {
  run: RunEvent;
}

const ShareButton: React.FC<ShareButtonProps> = ({ run }) => {
  const handleShare = async () => {
    const shareUrl = window.location.href;
    
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

    const shareTitle = `Join me on this run! 🏃‍♀️`;
    const shareText = `Join me on this run! 🏃‍♀️
${run.title} by ${getHostDisplayName()}
📅 ${new Date(run.date).toLocaleDateString()} at ${run.time}
📍 ${run.location}
🏃‍♂️ ${run.distance}km at ${formatPace(run.pace)}

Register for the run here on Comovo:`;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        // Try to share with image if available
        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        };

        // If we have an image URL, try to include it
        if (run.imageUrl && run.imageUrl.startsWith('http')) {
          try {
            const response = await fetch(run.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'run-image.jpg', { type: blob.type });
            shareData.files = [file];
          } catch (error) {
            console.log('Could not include image in share:', error);
            // Continue without image if fetch fails
          }
        }

        await navigator.share(shareData);
        console.log('Share successful');
      } catch (error) {
        console.log('Share cancelled or failed:', error);
        // Fall back to copy to clipboard
        fallbackToCopy(shareText, shareUrl);
      }
    } else {
      // Fall back to copy to clipboard for unsupported browsers
      fallbackToCopy(shareText, shareUrl);
    }
  };

  const fallbackToCopy = async (text: string, url: string) => {
    try {
      const fullText = `${text}\n${url}`;
      await navigator.clipboard.writeText(fullText);
      toast.success('Run details copied to clipboard! 📋');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Unable to share or copy. Please copy the URL manually.');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      className="rounded-full"
      title="Share this run"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
};

export default ShareButton;
