
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import { useGeocoding } from "@/hooks/useGeocoding";
import { runEventsService } from "@/services/runEventsService";
import { RunEvent } from "@/types";

// Import form sections
import { formSchema, FormValues } from './create-run/FormSchema';
import BasicInfoSection from './create-run/BasicInfoSection';
import ImageUploadSection from './create-run/ImageUploadSection';
import LocationSection from './create-run/LocationSection';
import RunDetailsSection from './create-run/RunDetailsSection';
import DescriptionSection from './create-run/DescriptionSection';
import ParticipantsSection from './create-run/ParticipantsSection';
import TagsSection from './create-run/TagsSection';
import WhatsAppSection from './create-run/WhatsAppSection';

interface CreateRunFormProps {
  onRunCreated?: () => void;
}

const CreateRunForm: React.FC<CreateRunFormProps> = ({ onRunCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { geocodeAddress, latitude, longitude } = useGeocoding();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      location: "",
      address: "",
      distance: 5,
      pace: 6,
      description: "",
      maxParticipants: 20,
      tags: "",
      imageUrl: "",
      unlimitedSpots: false,
      whatsappGroupLink: "",
    },
  });

  // Watch the address field to trigger geocoding
  const addressValue = form.watch("address");

  // Trigger geocoding when address changes
  useEffect(() => {
    if (addressValue && addressValue.length > 5) {
      const timer = setTimeout(() => {
        geocodeAddress(addressValue);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [addressValue, geocodeAddress]);

  // Helper function to determine pace category
  const getPaceCategory = (pace: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (pace >= 8) return 'beginner';
    if (pace >= 6) return 'intermediate';
    return 'advanced';
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    try {
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Raw form values:', values);
      console.log('User business details:', user?.businessDetails);
      
      // Get coordinates from the LocationSection component's geocoding
      // We need to access the geocoding result from the LocationSection
      // For now, we'll proceed without coordinates validation as the LocationSection handles it
      
      // Create new run object - business info will be handled by the API
      const newRun: Partial<RunEvent> = {
        title: values.title,
        hostId: user?.id || '',
        hostName: user?.businessDetails?.businessName || user?.name || 'Business Host',
        date: values.date,
        time: values.time,
        location: values.location,
        address: values.address,
        distance: values.distance,
        pace: values.pace,
        paceCategory: getPaceCategory(values.pace),
        description: values.description,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        maxParticipants: values.unlimitedSpots ? undefined : values.maxParticipants,
        currentParticipants: 0,
        whatsappGroupLink: values.whatsappGroupLink ? values.whatsappGroupLink : undefined,
        hostContactInfo: {
          email: user?.email,
          businessName: user?.businessDetails?.businessName,
          businessLocation: values.address,
          phone: user?.businessDetails?.businessPhone,
        }
      };

      console.log('=== NEW RUN OBJECT DEBUG ===');
      console.log('newRun with business info:', newRun);
      
      // Save to Xano API with geocoded coordinates
      const businessId = parseInt(user?.id || '1');
      
      console.log('=== GEOCODING COORDINATES ===');
      console.log('Geocoded latitude:', latitude);
      console.log('Geocoded longitude:', longitude);
      
      // Use the geocoded coordinates from the hook
      const createdRun = await runEventsService.createEventWithBusinessInfo(
        newRun, 
        businessId, 
        latitude, // Use geocoded latitude
        longitude, // Use geocoded longitude
        selectedImageFile || undefined,
        user?.businessDetails?.businessName,
        undefined, // business latitude
        undefined  // business longitude
      );
      
      console.log('Run created successfully:', createdRun);
      
      toast.success('Run created successfully!');
      
      // Reset form
      form.reset();
      setImagePreview(null);
      setSelectedImageFile(null);
      
      if (onRunCreated) {
        onRunCreated();
      }
    } catch (error) {
      console.error('Error creating run:', error);
      toast.error('Failed to create run. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <ImageUploadSection 
          form={form} 
          imagePreview={imagePreview} 
          setImagePreview={setImagePreview}
          setSelectedImageFile={setSelectedImageFile}
        />
        <LocationSection form={form} />
        <RunDetailsSection form={form} />
        <DescriptionSection form={form} />
        <ParticipantsSection form={form} />
        <WhatsAppSection form={form} />
        <TagsSection form={form} />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Run'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateRunForm;
