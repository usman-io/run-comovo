
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatPace } from '@/utils/helpers';
import { toast } from 'sonner';

interface RunRegistrationFormProps {
  runId: string;
  onRegistrationComplete?: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  pace: z.number().min(3).max(12),
});

const RunRegistrationForm: React.FC<RunRegistrationFormProps> = ({ 
  runId,
  onRegistrationComplete
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      pace: 6,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Here would be the API call to register for the run
      console.log('Registering for run:', runId, 'with values:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Successfully registered for the run!');
      
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (error) {
      console.error('Error registering for run:', error);
      toast.error('Failed to register for the run. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="pace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Pace ({formatPace(field.value)})</FormLabel>
              <FormControl>
                <Slider
                  min={3}
                  max={12}
                  step={0.1}
                  defaultValue={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Fast (3:00)</span>
                <span>Slow (12:00)</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register for Run'}
        </Button>
      </form>
    </Form>
  );
};

export default RunRegistrationForm;
