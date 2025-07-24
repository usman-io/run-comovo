
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User as AuthUser } from '@/contexts/auth/types';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileService } from '@/services/userProfileService';
import { useGeocoding } from '@/hooks/useGeocoding';
import { toast } from 'sonner';
import { MapPin, Map, AlertCircle } from 'lucide-react';

interface BusinessProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

const BusinessProfileEditDialog: React.FC<BusinessProfileEditDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { geocodeAddress, latitude, longitude, isLoading: isGeocoding, error } = useGeocoding();
  
  // Extract coordinates from business location if it's a GeoPoint
  const getExistingCoordinates = () => {
    const businessLocation = user.businessDetails?.businessLocation;
    if (businessLocation && typeof businessLocation === 'object' && businessLocation.type === 'point') {
      return {
        lat: businessLocation.data?.lat || null,
        lng: businessLocation.data?.lng || null
      };
    }
    return { lat: null, lng: null };
  };

  const existingCoords = getExistingCoordinates();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    businessName: user.businessDetails?.businessName || '',
    businessLocation: typeof user.businessDetails?.businessLocation === 'string' 
      ? user.businessDetails.businessLocation 
      : '',
    businessPhone: user.businessDetails?.businessPhone || '',
    description: user.businessDetails?.description || '',
    website: user.businessDetails?.socialLinks?.website || '',
    linkedin: user.businessDetails?.socialLinks?.linkedin || '',
    instagram: user.businessDetails?.socialLinks?.instagram || '',
    facebook: user.businessDetails?.socialLinks?.facebook || '',
    twitter: user.businessDetails?.socialLinks?.twitter || '',
    google_review: user.businessDetails?.socialLinks?.google_review || '',
    address: user.businessDetails?.address || '',
  });

  // Geocode the business location when it changes
  useEffect(() => {
    if (formData.businessLocation && formData.businessLocation.length > 5) {
      const timer = setTimeout(() => {
        geocodeAddress(formData.businessLocation);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [formData.businessLocation, geocodeAddress]);

  // Show error toast when geocoding fails
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Business profile save - user.role:', user.role);
      
      const profileData = {
        name: formData.name,
        email: formData.email,
        role: user.role || 'business',
        businessPhone: formData.businessPhone,
        businessDescription: formData.description,
        website: formData.website,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        facebook: formData.facebook,
        twitter: formData.twitter,
        google_review: formData.google_review,
      };

      // Only include businessDetails if we have coordinates or if it's just a name update
      if (formData.businessName) {
        const businessDetails: any = {
          businessName: formData.businessName,
          address: formData.address, // Include address field
        };

        // Only include location data if geocoding was successful
        if (latitude && longitude && !error) {
          businessDetails.businessLocation = formData.businessLocation;
          businessDetails.latitude = latitude;
          businessDetails.longitude = longitude;
        }

        (profileData as any).businessDetails = businessDetails;
      }

      console.log('Profile data to update:', profileData);
      console.log('Role being sent:', profileData.role);

      const updatedUser = await userProfileService.updateProfile(user.id, profileData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Open Google Maps in a new tab
  const openInGoogleMaps = () => {
    if (formData.businessLocation) {
      const encodedAddress = encodeURIComponent(formData.businessLocation);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  // Get current coordinates (either from new geocoding or existing)
  const currentLat = latitude || existingCoords.lat;
  const currentLng = longitude || existingCoords.lng;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            
            <div>
              <Label htmlFor="name">Contact Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium">Business Location</h4>
              </div>
              
              <div>
                <Label htmlFor="businessLocation">Location for Geocoding</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="businessLocation"
                      value={formData.businessLocation}
                      onChange={(e) => handleChange('businessLocation', e.target.value)}
                      placeholder="123 Main St, City, State, ZIP"
                    />
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={openInGoogleMaps}
                    disabled={!formData.businessLocation}
                    title="View in Google Maps"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
                {formData.businessLocation && formData.businessLocation.length > 5 && !error && (
                  <p className="text-sm text-gray-500 mt-1">
                    Address will be automatically geocoded for map display
                  </p>
                )}
                {currentLat && currentLng && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    Coordinates: {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Display Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter address to display on profile"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This address will be displayed on your business profile
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="businessPhone">Phone Number</Label>
              <Input
                id="businessPhone"
                value={formData.businessPhone}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell us about your business..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Social Media Links</h4>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>

            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourbusiness"
              />
            </div>

            <div>
              <Label htmlFor="google_review">Google Reviews</Label>
              <Input
                id="google_review"
                value={formData.google_review}
                onChange={(e) => handleChange('google_review', e.target.value)}
                placeholder="https://g.page/yourbusiness/review"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessProfileEditDialog;
