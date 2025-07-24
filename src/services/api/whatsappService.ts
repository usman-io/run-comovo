
import { BaseApiService } from './baseApi';

interface WhatsAppMessage {
  to: string;
  text: string;
}

interface WhatsAppResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

class WhatsAppApiService extends BaseApiService {
  private readonly whatsappToken = 'YOUR_WHATSAPP_TOKEN'; // This should be moved to environment variables
  private readonly phoneNumberId = 'YOUR_PHONE_NUMBER_ID'; // This should be moved to environment variables
  
  async sendMessage(to: string, message: string): Promise<WhatsAppResponse> {
    try {
      console.log('WhatsAppApiService.sendMessage: Sending message to:', to);
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('WhatsAppApiService.sendMessage: Response received:', data);
      
      return {
        success: true,
        message: 'Message sent successfully',
        messageId: data.messages?.[0]?.id
      };
    } catch (error) {
      console.error('WhatsAppApiService.sendMessage: Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }

  async sendGroupInvites(participants: Array<{ name: string; phone: string }>, groupLink: string, runTitle: string): Promise<{ success: number; failed: number; errors: string[] }> {
    console.log('WhatsAppApiService.sendGroupInvites: Sending invites to', participants.length, 'participants');
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const participant of participants) {
      try {
        const message = `Hi ${participant.name}, please join our WhatsApp group for "${runTitle}" to stay updated: ${groupLink}`;
        const result = await this.sendMessage(participant.phone, message);
        
        if (result.success) {
          success++;
        } else {
          failed++;
          errors.push(`Failed to send to ${participant.name}: ${result.message}`);
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
        errors.push(`Failed to send to ${participant.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, failed, errors };
  }
}

export const whatsappApi = new WhatsAppApiService();
