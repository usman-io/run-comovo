import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Users, Edit, Globe, Linkedin, Instagram, Facebook, Twitter, Phone, Mail, ExternalLink } from 'lucide-react';
import BusinessProfileEditDialog from '@/components/business/BusinessProfileEditDialog';
import BusinessFeed from '@/components/business/BusinessFeed';
import BusinessEventHistory from '@/components/business/BusinessEventHistory';
import BusinessUpcomingEvents from '@/components/business/BusinessUpcomingEvents';
import ProfileImageUpload from '@/components/business/ProfileImageUpload';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatLocationForDisplay, formatLocationSync } from '@/utils/locationHelpers';
import { userImageService } from '@/services/userImageService';
import { userProfileService } from '@/services/userProfileService';
import { User } from '@/contexts/auth/types';

const BusinessProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [locationName, setLocationName] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load complete user profile data on mount
  useEffect(() => {
    const loadCompleteUserProfile = async () => {
      if (!user?.id) {
        console.log('BusinessProfilePage: No user ID available, stopping load');
        setIsLoading(false);
        return;
      }
      
      console.log('BusinessProfilePage: Loading complete user profile for ID:', user.id);
      console.log('BusinessProfilePage: Current user from auth context:', user);
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the latest user profile data from backend
        console.log('BusinessProfilePage: About to call userProfileService.getCurrentProfile()');
        const completeUserData = await userProfileService.getCurrentProfile();
        console.log('BusinessProfilePage: Complete user data loaded:', completeUserData);
        console.log('BusinessProfilePage: Business details:', completeUserData.businessDetails);
        console.log('BusinessProfilePage: Business name:', completeUserData.businessDetails?.businessName);
        console.log('BusinessProfilePage: Business description:', completeUserData.businessDetails?.businessDescription);
        console.log('BusinessProfilePage: Social links:', completeUserData.businessDetails?.socialLinks);
        
        setCurrentUser(completeUserData);
        
        // Update the auth context with the complete data
        setUser(completeUserData);
        localStorage.setItem('user', JSON.stringify(completeUserData));
        
        console.log('BusinessProfilePage: Profile data loaded successfully');
      } catch (error) {
        console.error('BusinessProfilePage: Failed to load complete user profile:', error);
        console.error('BusinessProfilePage: Error details:', error.message);
        console.error('BusinessProfilePage: Stack trace:', error.stack);
        setError('Failed to load profile data');
        
        // If fetching fails, use the current user data as fallback
        console.log('BusinessProfilePage: Using fallback user data from auth context');
        setCurrentUser(user);
      } finally {
        setIsLoading(false);
        console.log('BusinessProfilePage: Loading state set to false');
      }
    };

    loadCompleteUserProfile();
  }, [user?.id]); // Only depend on user ID to avoid infinite loops

  // Load profile image
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!currentUser?.id) return;
      
      try {
        // First try to get from user profile
        if (currentUser.profileImageUrl) {
          setProfileImageUrl(currentUser.profileImageUrl);
          return;
        }
        
        // If not available, try to load from Supabase
        const imageUrl = await userImageService.getProfileImageUrlAsync(currentUser.id);
        if (imageUrl) {
          setProfileImageUrl(imageUrl);
        }
      } catch (error) {
        console.log('No profile image found, using default');
      }
    };

    loadProfileImage();
  }, [currentUser?.id, currentUser?.profileImageUrl]);

  useEffect(() => {
    let isMounted = true;
    const fetchLocationName = async () => {
      // Show the address field if available, otherwise fall back to business location
      const displayAddress = currentUser?.businessDetails?.address || currentUser?.businessDetails?.businessLocation;
      
      if (!displayAddress) {
        if (isMounted) setLocationName('Location not specified');
        return;
      }

      // If we have a simple address string, display it directly
      if (typeof displayAddress === 'string') {
        if (isMounted) setLocationName(displayAddress);
        return;
      }

      // For GeoPoint objects, try to get a readable address
      const syncLocation = formatLocationSync(displayAddress);
      if (isMounted) setLocationName(syncLocation);

      try {
        const asyncLocation = await formatLocationForDisplay(displayAddress);
        if (isMounted && asyncLocation !== syncLocation) {
          setLocationName(asyncLocation);
        }
      } catch (error) {
        console.error('Failed to load location:', error);
      }
    };
    fetchLocationName();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.businessDetails?.address, currentUser?.businessDetails?.businessLocation]);

  // Handle profile edit success - refresh the user data
  const handleProfileEditSuccess = async () => {
    setIsEditDialogOpen(false);
    
    // Refresh user data after successful edit
    try {
      const updatedUserData = await userProfileService.getCurrentProfile();
      setCurrentUser(updatedUserData);
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Failed to refresh user data after edit:', error);
    }
  };

  // Early returns with proper loading and error states
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  if (user.role !== 'business') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Access denied. Business account required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Use currentUser for display, fallback to user if not loaded yet
  const displayUser = currentUser || user;

  // Debug log to see what data we have for display
  console.log('BusinessProfilePage: displayUser for rendering:', displayUser);
  console.log('BusinessProfilePage: displayUser.businessDetails for rendering:', displayUser.businessDetails);
  console.log('BusinessProfilePage: Business name for display:', displayUser.businessDetails?.businessName);
  console.log('BusinessProfilePage: Business description for display:', displayUser.businessDetails?.businessDescription);

  // Get coordinates from business location for Google Maps link
  const getBusinessCoordinates = () => {
    const businessLocation = displayUser.businessDetails?.businessLocation;
    if (businessLocation && typeof businessLocation === 'object' && businessLocation.type === 'point') {
      return {
        lat: businessLocation.data?.lat,
        lng: businessLocation.data?.lng
      };
    }
    return null;
  };

  const coordinates = getBusinessCoordinates();

  // Create Google Maps link with coordinates
  const getGoogleMapsLink = () => {
    if (coordinates?.lat && coordinates?.lng) {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    }
    return null;
  };

  const googleMapsLink = getGoogleMapsLink();

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'website':
        return Globe;
      case 'linkedin':
        return Linkedin;
      case 'instagram':
        return Instagram;
      case 'facebook':
        return Facebook;
      case 'twitter':
        return Twitter;
      case 'google_review':
        return null;
      default:
        return Globe;
    }
  };

  const getSocialLabel = (platform: string) => {
    switch (platform) {
      case 'website':
        return 'Website';
      case 'linkedin':
        return 'LinkedIn';
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'twitter':
        return 'Twitter';
      case 'google_review':
        return 'Leave a Review';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-4 sm:py-8">
        <div className="app-container">
          {/* Business Profile Header */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                <div className="flex items-start space-x-4 sm:space-x-6 min-w-0 flex-1">
                  <ProfileImageUpload 
                    currentImageUrl={profileImageUrl || displayUser.profileImageUrl} 
                    className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                      {displayUser.businessDetails?.businessName || displayUser.name || 'Business Name Not Set'}
                    </h1>
                    {locationName && locationName !== 'Location not specified' && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2 flex-wrap">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">{locationName}</span>
                        {googleMapsLink && (
                          <a 
                            href={googleMapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                            title="View on Google Maps"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Member since {new Date().getFullYear()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Community Builder
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsEditDialogOpen(true)} 
                  variant="outline" 
                  className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About Our Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">
                  {displayUser.businessDetails?.businessDescription || 
                   displayUser.businessDetails?.description ||
                   (displayUser.businessDetails?.businessName 
                     ? `Welcome to ${displayUser.businessDetails.businessName}! We're passionate about building community through running and bringing people together for healthy, active lifestyles.`
                     : 'We\'re passionate about building community through running and bringing people together for healthy, active lifestyles.'
                   )}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${displayUser.email}`} className="hover:text-blue-600">
                        {displayUser.email}
                      </a>
                    </div>
                    {displayUser.businessDetails?.businessPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${displayUser.businessDetails.businessPhone}`} className="hover:text-blue-600">
                          {displayUser.businessDetails.businessPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {displayUser.businessDetails?.address && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{displayUser.businessDetails.address}</span>
                      {googleMapsLink && (
                        <a 
                          href={googleMapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-1"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Social media section using direct fields */}
              {(() => {
                const socialLinks = {
                  website: displayUser.businessDetails?.website,
                  instagram: displayUser.businessDetails?.instagram,
                  facebook: displayUser.businessDetails?.facebook,
                  twitter: displayUser.businessDetails?.twitter,
                  linkedin: displayUser.businessDetails?.linkedin,
                  google_review: displayUser.businessDetails?.google_review
                };

                console.log('BusinessProfilePage: Social links for display:', socialLinks);
                const hasSocialLinks = Object.values(socialLinks).some(Boolean);
                console.log('BusinessProfilePage: Has social links:', hasSocialLinks);

                return (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Social Media</h4>
                    {hasSocialLinks ? (
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(socialLinks).map(([platform, url]) => {
                          if (!url) return null;
                          const IconComponent = getSocialIcon(platform);
                          return (
                            <a 
                              key={platform} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                            >
                              {IconComponent && <IconComponent className="w-4 h-4" />}
                              {getSocialLabel(platform)}
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No social media links added yet. Click "Edit Profile" to add them.</p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Profile Content Tabs */}
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Updates & Feed</TabsTrigger>
              <TabsTrigger value="events">Event History</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <BusinessFeed businessId={displayUser.id} />
            </TabsContent>

            <TabsContent value="events">
              <BusinessEventHistory businessId={displayUser.id} />
            </TabsContent>

            <TabsContent value="upcoming">
              <BusinessUpcomingEvents businessId={displayUser.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Edit Profile Dialog */}
      <BusinessProfileEditDialog 
        isOpen={isEditDialogOpen} 
        onClose={handleProfileEditSuccess}
        user={displayUser} 
      />
    </div>
  );
};

export default BusinessProfilePage;
