
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuth } from '@/contexts/AuthContext';
import { useGeocoding } from '@/hooks/useGeocoding';
import { toast } from 'sonner';

// Import refactored components
import { signupSchema, FormValues, SignupFormProps } from './signup/types';
import RoleSelector from './signup/RoleSelector';
import RunnerFields from './signup/RunnerFields';
import BusinessFields from './signup/BusinessFields';
import CommonFields from './signup/CommonFields';

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, suggestedRole }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { geocodeAddress, latitude, longitude, isLoading: isGeocoding } = useGeocoding();

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: suggestedRole || "runner",
      ...(suggestedRole === "business" && { countryCode: "+34" })
    },
    mode: "onChange"
  });

  // Watch for role changes to dynamically update form fields
  const selectedRole = form.watch("role");
  const locationValue = form.watch("location");

  // Geocode the location when it changes (for business accounts)
  useEffect(() => {
    if (selectedRole === "business" && locationValue && locationValue.length > 5) {
      const timer = setTimeout(() => {
        geocodeAddress(locationValue);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [locationValue, selectedRole, geocodeAddress]);

  const handleSignup = async (values: FormValues) => {
    console.log('=== SIGNUP FORM SUBMISSION STARTED ===');
    console.log('SignupForm.handleSignup called with values:', values);
    
    // Log form validation state
    console.log('Form errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    
    setIsLoading(true);
    try {
      // Pass the entire values object to signup
      const userData = {
        ...values,
        latitude,
        longitude
      };
      
      console.log('SignupForm: Calling signup with userData:', userData);
      await signup(userData);
      console.log('SignupForm: Signup completed - AuthContext will handle redirect');
      
      // Don't call onSuccess here since AuthContext handles the redirect
      // The success toast is also handled in AuthContext
      
      console.log('=== SIGNUP FORM SUBMISSION COMPLETED ===');
    } catch (error) {
      console.error('=== SIGNUP FORM SUBMISSION FAILED ===');
      console.error('SignupForm.handleSignup error:', error);
      // Error handling is done in AuthContext, so we don't need to do anything here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
          <RoleSelector form={form} />
          
          {/* Conditional fields based on role */}
          {selectedRole === "runner" ? (
            <RunnerFields form={form} />
          ) : (
            <BusinessFields 
              form={form} 
              isGeocoding={isGeocoding} 
              latitude={latitude} 
              longitude={longitude} 
            />
          )}
          
          {/* Common fields for both roles */}
          <CommonFields form={form} />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
