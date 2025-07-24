
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, UserRole, AuthContextType } from './auth/types';
import { authService } from './auth/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Change isLoading to loading
  const navigate = useNavigate();

  // Check for stored user on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Loaded stored user:', parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    console.log('AuthContext.login called with:', email);
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      console.log('AuthContext.login successful, user:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Logged in successfully!');
      
      // Redirect based on user role
      if (user.role === 'business') {
        console.log('Redirecting business user to /business/home');
        navigate('/business/home');
      } else {
        console.log('Redirecting runner user to /user-home');
        navigate('/user-home');
      }
    } catch (error) {
      console.error('AuthContext.login error:', error);
      if (error instanceof Error && error.message.includes('verify your email')) {
        toast.error(error.message);
        navigate('/verify-email', { state: { email } });
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with any user data format
  const signup = async (userData: any) => {
    console.log('AuthContext.signup called with:', userData);
    setLoading(true);
    try {
      console.log('Calling authService.signup...');
      
      // Extract the data based on the format we expect
      const { name, personName, email, password, role, businessName, location, businessPhone, countryCode } = userData;
      const actualName = name || personName;
      
      let businessDetails;
      if (role === 'business') {
        businessDetails = {
          businessName: businessName || '',
          businessLocation: location || '',
          businessPhone: businessPhone ? `${countryCode || ''}${businessPhone}` : undefined
        };
      }
      
      const result = await authService.signup(actualName, email, password, role, businessDetails);
      console.log('AuthContext.signup successful, result:', result);
      
      // Always redirect to verification reminder page after successful signup
      console.log('Signup completed, redirecting to verification reminder page...');
      toast.success('Account created! Please check your email to verify your account.');
      navigate('/verification-reminder');
      
      console.log('=== SIGNUP FORM SUBMISSION COMPLETED ===');
    } catch (error) {
      console.error('AuthContext.signup error:', error);
      if (error instanceof Error) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      // Don't re-throw the error here - let the signup complete and show the error to user
      console.log('Signup failed, but not redirecting due to error');
    } finally {
      setLoading(false);
    }
  };

  // Update user state (for profile updates)
  const handleSetUser = (updatedUser: User) => {
    console.log('AuthContext.setUser called with:', updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Logout
  const logout = () => {
    console.log('AuthContext.logout called');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('xanoAuthToken');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const contextValue: AuthContextType = {
    user,
    loading, // Use loading instead of isLoading
    error: null, // Add error property
    login,
    signup,
    logout,
    setUser: handleSetUser,
    clearError: () => {}, // Add clearError method
    isAuthenticated: !!user
  };

  console.log('AuthProvider rendering with context value:', {
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    loading
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types for easy access
export type { User, UserRole, AuthContextType };
