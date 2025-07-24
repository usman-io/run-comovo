
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
  requiredRole?: 'runner' | 'business' | null;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, requiredRole = null }) => {
  const location = useLocation();
  
  // Add error boundary for auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('AuthRoute: useAuth hook failed:', error);
    // If auth context is not available, redirect to login
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  const { user, loading } = authContext;

  console.log('AuthRoute: user =', user);
  console.log('AuthRoute: loading =', loading);
  console.log('AuthRoute: requiredRole =', requiredRole);

  // Show loading while checking auth state
  if (loading) {
    console.log('AuthRoute: Still loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    console.log('AuthRoute: No user found, redirecting to login...');
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  // If a specific role is required and the user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    console.log('AuthRoute: User role mismatch. Required:', requiredRole, 'User has:', user.role);
    return <Navigate to="/" replace />;
  }

  console.log('AuthRoute: User authenticated and authorized, rendering children');
  // User is authenticated and has the right role
  return <>{children}</>;
};

export default AuthRoute;
