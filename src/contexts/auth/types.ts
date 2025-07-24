
export type UserRole = 'runner' | 'business';

export interface BusinessDetails {
  businessName: string;
  businessLocation: string | { type: string; data: { lat: number; lng: number } };
  businessPhone?: string;
  description?: string;
  businessDescription?: string; // Add this for compatibility
  address?: string;
  businessType?: string;
  // Direct social media fields for easier access
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  google_review?: string;
  // Nested social links object
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    google_review?: string;
  };
}

export interface RunnerDetails {
  pace: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string;
  businessDetails?: BusinessDetails;
  runnerDetails?: RunnerDetails;
  emailVerified?: boolean;
  isActive?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: any) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  isAuthenticated: boolean;
}
