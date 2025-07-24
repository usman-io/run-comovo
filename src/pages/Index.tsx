import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeeklyRunsCarousel from '@/components/runs/WeeklyRunsCarousel';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
const Index = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const handleHostClick = () => {
    if (!user) {
      navigate('/login', {
        state: {
          redirectTo: '/business/dashboard',
          role: 'business'
        }
      });
    } else if (user.role !== 'business') {
      toast.error('Only business accounts can access host features');
    } else {
      navigate('/business/dashboard');
    }
  };
  const isLoggedIn = !!user;
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-pacers-blue text-white py-12 md:py-24">
          <div className="app-container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold">Comovo is live.</h1>
              <p className="text-lg md:text-xl opacity-90">We’re building the tools for communities to run together. 
And you’re invited to be part of the first.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-white text-pacers-blue hover:bg-gray-100 hover:text-pacers-blue">
                  <Link to="/runs">Find Runs</Link>
                </Button>
                {!isLoggedIn && <Button variant="outline" size="lg" onClick={handleHostClick} className="border-white bg-neutral-50 text-pacers-blue hover:bg-gray-100 hover:text-pacers-blue">
                    Host a Run
                  </Button>}
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Runs Section */}
        <section className="py-16">
          <div className="app-container">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Runs</span>
                  <Link to="/runs">
                    <Button variant="outline" size="sm" className="hover:bg-gray-100 hover:text-pacers-blue">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyRunsCarousel />
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* How it Works Section - Only shown to non-logged in users */}
        {!isLoggedIn && <section className="py-16 bg-gray-50">
            <div className="app-container">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold mb-3">How It Works</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">Joining community runs should be easy. With Comovo it is.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-lg text-center space-y-3 card-shadow">
                  <div className="w-12 h-12 bg-pacers-blue/10 text-pacers-blue rounded-full flex items-center justify-center mx-auto font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-lg">Create an account</h3>
                  <p className="text-muted-foreground">Sign up and verify your account using only your email.</p>
                </div>
                
                {/* Step 2 */}
                <div className="bg-white p-6 rounded-lg text-center space-y-3 card-shadow">
                  <div className="w-12 h-12 bg-pacers-blue/10 text-pacers-blue rounded-full flex items-center justify-center mx-auto font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-lg">Register</h3>
                  <p className="text-muted-foreground">Register for the run with one click. </p>
                </div>
                
                {/* Step 3 */}
                <div className="bg-white p-6 rounded-lg text-center space-y-3 card-shadow">
                  <div className="w-12 h-12 bg-pacers-blue/10 text-pacers-blue rounded-full flex items-center justify-center mx-auto font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-lg">Run Together</h3>
                  <p className="text-muted-foreground">
                    Show up, meet new people, and enjoy the run with your local running community.
                  </p>
                </div>
              </div>
            </div>
          </section>}
        
        {/* Host CTA Section - Only shown to non-logged in users */}
        {!isLoggedIn && <section className="py-16">
            <div className="app-container">
              <div className="bg-pacers-blue rounded-lg p-8 md:p-12 text-white">
                <div className="md:flex items-center justify-between">
                  <div className="mb-6 md:mb-0 md:mr-8">
                    <h2 className="text-2xl font-bold mb-3">Are you a business?</h2>
                    <p className="opacity-90 max-w-lg">Host community runs to bring runners to your location, build your brand, and take advantage of the local running community.</p>
                  </div>
                  <Button size="lg" className="whitespace-nowrap bg-white text-pacers-blue hover:bg-gray-100 hover:text-pacers-blue" onClick={handleHostClick}>
                    Become a Host
                  </Button>
                </div>
              </div>
            </div>
          </section>}
      </main>
      
      <Footer />
    </div>;
};
export default Index;