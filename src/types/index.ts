
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'runner' | 'business';
  profileImageUrl?: string;
  businessDetails?: {
    businessName: string;
    businessLocation: string | { type: string; data: { lat: number; lng: number } };
    businessPhone?: string;
    description?: string;
    businessDescription?: string;
    address?: string;
    businessType?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    google_review?: string;
    socialLinks?: {
      website?: string;
      instagram?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      google_review?: string;
    };
  };
}

export interface Business {
  id: string;
  name: string;
  email: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface RunEvent {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  date: string; // ISO date string
  time: string;
  location: string;
  address: string;
  distance: number; // in km
  pace: number; // in min/km
  paceCategory: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  imageUrl?: string;
  tags?: string[];
  maxParticipants?: number;
  currentParticipants?: number;
  latitude?: number;  // Added latitude property
  longitude?: number; // Added longitude property
  whatsappGroupLink?: string; // Added WhatsApp group link
  hostContactInfo?: {
    email?: string;
    phone?: string;
    businessName?: string;
    businessLocation?: string;
  };
}

export interface RunRegistration {
  id: string;
  runId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPace: number;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
