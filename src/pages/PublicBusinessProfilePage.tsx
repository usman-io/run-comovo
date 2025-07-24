import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Calendar, Users, Globe, Linkedin, Instagram, Facebook, Twitter, Phone, Mail, Navigation } from 'lucide-react';
import BusinessFeed from '@/components/business/BusinessFeed';
import BusinessEventHistory from '@/components/business/BusinessEventHistory';
import BusinessUpcomingEvents from '@/components/business/BusinessUpcomingEvents';
import { usersApi } from '@/services/api';
import { transformXanoUser } from '@/services/dataTransforms';
import { User as AuthUser } from '@/contexts/auth/types';
import { toast } from 'sonner';
import { formatLocationForDisplay, formatLocationSync } from '@/utils/locationHelpers';
import { userImageService } from '@/services/userImageService';

const PublicBusinessProfilePage = () => {
  const {
    businessId
  } = useParams<{
    businessId: string;
  }>();
  const [business, setBusiness] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile();
    }
  }, [businessId]);

  // Load profile image when business data is available
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!business?.id) return;
      try {
        // First try to get from business profile
        if (business.profileImageUrl) {
          setProfileImageUrl(business.profileImageUrl);
          return;
        }

        // If not available, try to load from Supabase
        const imageUrl = await userImageService.getProfileImageUrlAsync(business.id);
        if (imageUrl) {
          setProfileImageUrl(imageUrl);
        }
      } catch (error) {
        console.log('No profile image found for business, using default');
      }
    };
    loadProfileImage();
  }, [business?.id, business?.profileImageUrl]);
  // Location formatting - use direct address instead of geocoding
  useEffect(() => {
    if (business?.businessDetails?.address) {
      setLocationName(business.businessDetails.address);
    } else {
      setLocationName('Location not specified');
    }
  }, [business?.businessDetails?.address]);
  const fetchBusinessProfile = async () => {
    try {
      setIsLoading(true);
      const xanoUser = await usersApi.getUser(Number(businessId));
      const businessUser = transformXanoUser(xanoUser);
      setBusiness(businessUser);
    } catch (error) {
      console.error('Error fetching business profile:', error);
      toast.error('Failed to load business profile');
    } finally {
      setIsLoading(false);
    }
  };
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
      // No icon for Google Review
      default:
        return Globe;
    }
  };
  const openInGoogleMaps = () => {
    if (!business?.businessDetails?.address) return;
    
    // Use the displayed address directly
    const encodedAddress = encodeURIComponent(business.businessDetails.address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    
    window.open(googleMapsUrl, '_blank');
  };
  if (isLoading) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="app-container">
            <div className="space-y-4">
              <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  if (!business) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="app-container">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
              <p className="text-gray-600">The business profile you're looking for doesn't exist.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          {/* Business Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={profileImageUrl} 
                    alt={business.businessDetails?.businessName || business.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {business.businessDetails?.businessName || business.name}
                  </h1>
                  {locationName && locationName !== 'Location not specified' && <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{locationName}</span>
                      <button onClick={openInGoogleMaps} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm ml-2" title="Get directions">
                        <Navigation className="w-3 h-3" />
                        Get Directions
                      </button>
                    </div>}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Community Host
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Run Organizer
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* About This Business */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">
                  {business.businessDetails?.description || (business.businessDetails?.businessName ? `Welcome to ${business.businessDetails.businessName}! We're passionate about building community through running and bringing people together for healthy, active lifestyles.` : 'We\'re passionate about building community through running and bringing people together for healthy, active lifestyles.')}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${business.email}`} className="hover:text-blue-600">
                      {business.email}
                    </a>
                  </div>
                  {business.businessDetails?.businessPhone && <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${business.businessDetails.businessPhone}`} className="hover:text-blue-600">
                        {business.businessDetails.businessPhone}
                      </a>
                    </div>}
                </div>
              </div>

              {business.businessDetails?.socialLinks && Object.values(business.businessDetails.socialLinks).some(Boolean) && <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Connect With Us</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(business.businessDetails.socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const IconComponent = getSocialIcon(platform);
                  return <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {platform === 'google_review' ? 'Leave a Review' : platform === 'website' ? 'Visit Website' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>;
                })}
                  </div>
                </div>}
            </CardContent>
          </Card>

          {/* Profile Content Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="feed">Updates & Feed</TabsTrigger>
              <TabsTrigger value="events">Past Events</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <BusinessUpcomingEvents businessId={business.id} />
            </TabsContent>

            <TabsContent value="feed">
              <BusinessFeed businessId={business.id} />
            </TabsContent>

            <TabsContent value="events">
              <BusinessEventHistory businessId={business.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>;
};

export default PublicBusinessProfilePage;
