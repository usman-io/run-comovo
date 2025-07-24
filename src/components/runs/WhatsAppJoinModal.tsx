
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface WhatsAppJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappLink: string;
  runTitle: string;
}

const WhatsAppJoinModal: React.FC<WhatsAppJoinModalProps> = ({
  isOpen,
  onClose,
  whatsappLink,
  runTitle
}) => {
  const handleJoinWhatsApp = () => {
    window.open(whatsappLink, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Join WhatsApp Group
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You're Registered!</h3>
            <p className="text-gray-600 mb-4">
              Successfully registered for <strong>{runTitle}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Join the WhatsApp group to stay updated with run details, weather updates, and connect with other participants.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleJoinWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Join WhatsApp Group
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppJoinModal;
