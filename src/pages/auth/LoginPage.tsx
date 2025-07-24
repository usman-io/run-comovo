
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/forms/LoginForm';
import SignupForm from '@/components/forms/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Always call useAuth hook - never conditionally
  const { user, loading } = useAuth();
  
  // Get redirect path and role from location state, if available
  const redirectTo = location.state?.redirectTo || '/';
  const suggestedRole = location.state?.role || null;

  // Redirect logged-in users to their appropriate home page
  useEffect(() => {
    if (!loading && user) {
      console.log('User is already logged in, redirecting...');
      if (user.role === 'business') {
        navigate('/business/home', { replace: true });
      } else if (user.role === 'runner') {
        navigate('/user-home', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Don't render login page if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="app-container max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
                  <LoginForm onSuccess={() => navigate(redirectTo)} />
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="text-sm text-pacers-blue hover:underline"
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup">
                  <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
                  <SignupForm 
                    onSuccess={() => navigate(redirectTo)} 
                    suggestedRole={suggestedRole} 
                  />
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-sm text-pacers-blue hover:underline"
                    >
                      Already have an account? Login
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
