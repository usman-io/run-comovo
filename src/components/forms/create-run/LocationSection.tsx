
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./FormSchema";
import { Map, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeocoding } from "@/hooks/useGeocoding";
import { toast } from "sonner";

interface LocationSectionProps {
  form: UseFormReturn<FormValues>;
}

const LocationSection: React.FC<LocationSectionProps> = ({ form }) => {
  const address = form.watch("address");
  const { geocodeAddress, latitude, longitude, isLoading: isGeocoding, error } = useGeocoding();

  // Geocode address when it changes
  useEffect(() => {
    if (address && address.length > 5) {
      const timer = setTimeout(() => {
        console.log('Geocoding address:', address);
        geocodeAddress(address);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [address, geocodeAddress]);

  // Show error toast when geocoding fails
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Open Google Maps in a new tab
  const openInGoogleMaps = () => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium">Location Information</h3>
      </div>
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Name</FormLabel>
            <FormControl>
              <Input placeholder="City Park" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <div className="flex gap-2">
              <FormControl className="flex-1">
                <div className="relative">
                  <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                  {isGeocoding && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MapPin className="h-4 w-4 animate-pulse text-blue-500" />
                    </div>
                  )}
                  {error && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
              </FormControl>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={openInGoogleMaps}
                disabled={!address}
                title="View in Google Maps"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
            {address && address.length > 5 && !error && (
              <p className="text-sm text-gray-500">
                Address will be automatically geocoded for map display
              </p>
            )}
            {latitude && longitude && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default LocationSection;
