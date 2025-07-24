
import { XanoUser, XanoEvent, XanoRegistration } from '@/services/api/types';
import { User, RunEvent, RunRegistration } from '@/types';

export const transformXanoUser = (xanoUser: XanoUser): User => {
  console.log('transformXanoUser: Starting transformation for user:', xanoUser);
  console.log('transformXanoUser: Detailed field mapping:', {
    'xanoUser.business_name': xanoUser.business_name,
    'xanoUser.business_location': xanoUser.business_location,
    'xanoUser.business_phone': xanoUser.business_phone,
    'xanoUser.business_description': xanoUser.business_description,
    'xanoUser.address': xanoUser.address,
    'xanoUser.website': xanoUser.website,
    'xanoUser.instagram': xanoUser.instagram,
    'xanoUser.facebook': xanoUser.facebook,
    'xanoUser.twitter': xanoUser.twitter,
    'xanoUser.linkedin': xanoUser.linkedin,
    'xanoUser.google_review': xanoUser.google_review,
    'xanoUser.business_type': xanoUser.business_type
  });
  
  const user: User = {
    id: xanoUser.id.toString(),
    name: xanoUser.name || '',
    email: xanoUser.email || '',
    role: xanoUser.role || 'runner',
    profileImageUrl: xanoUser.profile_image_url,
  };

  // Create businessDetails if we have ANY business-related fields OR if role is business
  const hasBusinessData = !!(
    xanoUser.business_name ||
    xanoUser.business_location ||
    xanoUser.business_phone ||
    xanoUser.business_description ||
    xanoUser.address ||
    xanoUser.website ||
    xanoUser.instagram ||
    xanoUser.facebook ||
    xanoUser.twitter ||
    xanoUser.linkedin ||
    xanoUser.google_review ||
    xanoUser.role === 'business'
  );

  console.log('transformXanoUser: hasBusinessData check:', hasBusinessData);

  if (hasBusinessData) {
    console.log('transformXanoUser: Creating business details object');
    
    // Create the business details object with explicit field mapping
    const businessDetails = {
      businessName: xanoUser.business_name || '',
      businessLocation: xanoUser.business_location || '',
      businessPhone: xanoUser.business_phone || '',
      description: xanoUser.business_description || '',
      businessDescription: xanoUser.business_description || '',
      address: xanoUser.address || '',
      businessType: xanoUser.business_type || '',
      // Map all social media fields directly - these are the actual field names from Xano
      website: xanoUser.website || '',
      instagram: xanoUser.instagram || '',
      facebook: xanoUser.facebook || '',
      twitter: xanoUser.twitter || '',
      linkedin: xanoUser.linkedin || '',
      google_review: xanoUser.google_review || '',
      // Create nested social links object for compatibility
      socialLinks: {
        website: xanoUser.website || '',
        instagram: xanoUser.instagram || '',
        facebook: xanoUser.facebook || '',
        twitter: xanoUser.twitter || '',
        linkedin: xanoUser.linkedin || '',
        google_review: xanoUser.google_review || ''
      }
    };
    
    console.log('transformXanoUser: Created businessDetails object:', businessDetails);
    console.log('transformXanoUser: Individual field check:', {
      'businessDetails.businessName': businessDetails.businessName,
      'businessDetails.businessDescription': businessDetails.businessDescription,
      'businessDetails.website': businessDetails.website,
      'businessDetails.instagram': businessDetails.instagram,
      'businessDetails.facebook': businessDetails.facebook
    });
    
    user.businessDetails = businessDetails;
  } else {
    console.log('transformXanoUser: No business data found, skipping businessDetails creation');
  }

  console.log('transformXanoUser: Final transformed user:', user);
  console.log('transformXanoUser: Final user.businessDetails:', user.businessDetails);
  return user;
};

export const transformXanoEvent = (xanoEvent: XanoEvent): RunEvent => {
  // Convert pace from seconds per km to minutes per km
  const paceMinutesPerKm = xanoEvent.pace_seconds_per_km / 60;
  
  // Determine pace category based on pace
  let paceCategory: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  if (paceMinutesPerKm >= 7) {
    paceCategory = 'beginner';
  } else if (paceMinutesPerKm <= 4.5) {
    paceCategory = 'advanced';
  }

  // Convert timestamp to separate date and time strings
  const eventDateTime = new Date(xanoEvent.event_start);
  const eventDate = eventDateTime.toISOString().split('T')[0]; // YYYY-MM-DD format
  const eventTime = eventDateTime.toTimeString().slice(0, 5); // HH:MM format

  // Handle location - it could be a string or GeoPoint object
  let latitude: number | undefined;
  let longitude: number | undefined;
  let locationString = '';

  if (xanoEvent.event_location) {
    if (typeof xanoEvent.event_location === 'string') {
      locationString = xanoEvent.event_location;
    } else if (xanoEvent.event_location.type === 'point' && xanoEvent.event_location.data) {
      latitude = xanoEvent.event_location.data.lat;
      longitude = xanoEvent.event_location.data.lng;
      locationString = `${latitude}, ${longitude}`;
    }
  }

  return {
    id: xanoEvent.id.toString(),
    title: xanoEvent.title,
    hostId: xanoEvent.business_id.toString(),
    hostName: xanoEvent.business_name,
    date: eventDate,
    time: eventTime,
    location: locationString,
    address: xanoEvent.event_address || locationString,
    distance: xanoEvent.distance,
    pace: paceMinutesPerKm,
    paceCategory,
    description: xanoEvent.description,
    maxParticipants: xanoEvent.max_participants,
    currentParticipants: 0, // This will be updated by the events service
    latitude,
    longitude,
    whatsappGroupLink: xanoEvent.whatsappGroupLink,
    hostContactInfo: {
      businessName: xanoEvent.business_name,
      phone: xanoEvent.business_phone
    }
  };
};

export const transformXanoRegistration = (xanoRegistration: XanoRegistration): RunRegistration => {
  return {
    id: xanoRegistration.id.toString(),
    runId: xanoRegistration.events_id.toString(),
    userId: xanoRegistration.runner_id.toString(),
    userName: xanoRegistration.user?.name || 'Unknown User',
    userEmail: xanoRegistration.user?.email || '',
    userPace: 0, // Default pace, this might need to be updated based on user data
    registeredAt: new Date(xanoRegistration.created_at).toISOString(),
    status: 'confirmed'
  };
};

// Add the missing export for transformToXanoEvent
export const transformToXanoEvent = (
  runEvent: Partial<RunEvent>,
  businessId: number,
  latitude?: number,
  longitude?: number,
  businessName?: string
) => {
  // Transform RunEvent to XanoEvent format
  const eventStart = runEvent.date && runEvent.time 
    ? new Date(`${runEvent.date.split('T')[0]}T${runEvent.time}`).getTime()
    : Date.now();

  const paceSecondsPerKm = runEvent.pace ? runEvent.pace * 60 : 300; // Default 5 min/km

  // Format event_location as POINT geometry object if coordinates are available
  let eventLocation: any;
  if (latitude && longitude) {
    eventLocation = {
      type: 'point',
      data: { lat: latitude, lng: longitude }
    };
  } else {
    // If no coordinates, we need to provide an empty string to satisfy the API requirement
    eventLocation = '';
  }

  return {
    title: runEvent.title || '',
    description: runEvent.description || '',
    event_start: eventStart,
    pace_seconds_per_km: paceSecondsPerKm,
    distance: runEvent.distance || 5,
    max_participants: runEvent.maxParticipants,
    business_id: businessId,
    business_name: businessName || '',
    event_location: eventLocation,
    event_address: runEvent.address || runEvent.location || '',
    whatsappGroupLink: runEvent.whatsappGroupLink || ''
  };
};
