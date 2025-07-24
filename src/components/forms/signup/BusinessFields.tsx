
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from 'lucide-react';
import { FormValues } from './types';

interface BusinessFieldsProps {
  form: UseFormReturn<FormValues>;
  isGeocoding: boolean;
  latitude?: number;
  longitude?: number;
}

const BusinessFields: React.FC<BusinessFieldsProps> = ({ 
  form, 
  isGeocoding, 
  latitude, 
  longitude 
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="personName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name</FormLabel>
            <FormControl>
              <Input placeholder="Acme Running Club" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Location</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="123 Main St, City, State" {...field} />
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
                Location found: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Phone</FormLabel>
            <FormControl>
              <div className="flex">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field: countryField }) => (
                    <Select onValueChange={countryField.onChange} defaultValue={countryField.value}>
                      <SelectTrigger className="w-20 rounded-r-none border-r-0 flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33</SelectItem>
                        <SelectItem value="+39">🇮🇹 +39</SelectItem>
                        <SelectItem value="+49">🇩🇪 +49</SelectItem>
                        <SelectItem value="+351">🇵🇹 +351</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+31">🇳🇱 +31</SelectItem>
                        <SelectItem value="+32">🇧🇪 +32</SelectItem>
                        <SelectItem value="+41">🇨🇭 +41</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input 
                  type="tel" 
                  placeholder="123456789" 
                  className="rounded-l-none flex-1"
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BusinessFields;
