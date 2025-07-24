
import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { userProfileService } from '@/services/userProfileService';
import { useGeocoding } from '@/hooks/useGeocoding';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  businessName: z.string().optional(),
  businessLocation: z.string().optional(),
});

interface ProfileFormProps {
  onSuccess?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess }) => {
  const { user, logout, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { geocodeAddress, latitude, longitude, isLoading: isGeocoding } = useGeocoding();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      businessName: user?.businessDetails?.businessName || "",
      businessLocation: typeof user?.businessDetails?.businessLocation === 'string' 
        ? user.businessDetails.businessLocation 
        : "",
    }
  });

  const businessLocationValue = form.watch("businessLocation");

  // Geocode the business location when it changes
  useEffect(() => {
    if (user?.role === 'business' && businessLocationValue && businessLocationValue.length > 5) {
      const timer = setTimeout(() => {
        geocodeAddress(businessLocationValue);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [businessLocationValue, user?.role, geocodeAddress]);

  const handleUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profileData = {
        name: values.name,
        email: values.email,
        role: user.role,
        ...(user.role === 'business' && {
          businessDetails: {
            businessName: values.businessName || '',
            businessLocation: values.businessLocation || '',
            ...(latitude && longitude && {
              latitude,
              longitude
            })
          }
        })
      };

      const updatedUser = await userProfileService.updateProfile(user.id, profileData);
      
      // Update the user context with the new data
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your full name" 
                  {...field} 
                  disabled={isLoading}
                />
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
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {user.role === 'business' && (
          <>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your business name" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="123 Main St, City, State" 
                        {...field} 
                        disabled={isLoading}
                      />
                      {isGeocoding && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <MapPin className="h-4 w-4 animate-pulse text-blue-500" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {latitude && longitude && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
