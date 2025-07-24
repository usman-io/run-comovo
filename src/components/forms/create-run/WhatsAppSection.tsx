
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MessageCircle } from 'lucide-react';
import { FormValues } from './FormSchema';

interface WhatsAppSectionProps {
  form: UseFormReturn<FormValues>;
}

const WhatsAppSection: React.FC<WhatsAppSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">WhatsApp Group</h3>
      </div>
      
      <FormField
        control={form.control}
        name="whatsappGroupLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp Group Invite Link (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://chat.whatsapp.com/..." 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Participants will be able to join this WhatsApp group to stay updated about the run.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default WhatsAppSection;
