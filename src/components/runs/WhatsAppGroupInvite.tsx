
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { whatsappApi } from '@/services/api/whatsappService';
import { RunRegistration } from '@/types';

interface WhatsAppGroupInviteProps {
  participants: RunRegistration[];
  runTitle: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const WhatsAppGroupInvite: React.FC<WhatsAppGroupInviteProps> = ({
  participants,
  runTitle,
  variant = 'outline',
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupLink, setGroupLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const handleSendInvites = async () => {
    if (!groupLink.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a WhatsApp group invite link',
        variant: 'destructive',
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: 'No Participants',
        description: 'There are no participants to invite',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock phone numbers for participants since we don't have them in the current data structure
      // In a real implementation, you'd need to add phone numbers to the user registration process
      const participantsWithPhones = participants.map((participant, index) => ({
        name: participant.userName,
        phone: `+1234567890${index}` // This is a placeholder - you'd need real phone numbers
      }));

      const result = await whatsappApi.sendGroupInvites(participantsWithPhones, groupLink, runTitle);

      if (result.success > 0) {
        toast({
          title: 'Invites Sent!',
          description: `Successfully sent ${result.success} invites${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        });
      }

      if (result.failed > 0) {
        console.error('Some invites failed:', result.errors);
        toast({
          title: 'Some Invites Failed',
          description: `${result.failed} invites failed to send. Check console for details.`,
          variant: 'destructive',
        });
      }

      setIsOpen(false);
      setGroupLink('');
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending WhatsApp invites:', error);
      toast({
        title: 'Error',
        description: 'Failed to send WhatsApp invites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Invite to WhatsApp Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Participants to WhatsApp Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupLink">WhatsApp Group Invite Link</Label>
            <Input
              id="groupLink"
              placeholder="https://chat.whatsapp.com/..."
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter the WhatsApp group invite link
            </p>
          </div>

          <div>
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              placeholder="Add a custom message that will be included with the invite..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Will send invites to {participants.length} participants</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvites} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invites
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppGroupInvite;
