
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WeeklyRunsCarousel from '@/components/runs/WeeklyRunsCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Calendar, Settings } from 'lucide-react';

const UserHomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Ready for your next run?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/runs">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 text-pacers-blue" />
                  <h3 className="font-semibold">Find Runs</h3>
                  <p className="text-sm text-muted-foreground">Discover new running events</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/my-runs">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-pacers-blue" />
                  <h3 className="font-semibold">My Runs</h3>
                  <p className="text-sm text-muted-foreground">View your registered runs</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-pacers-blue" />
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your account</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Upcoming Runs Carousel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Runs</span>
                <Link to="/runs">
                  <Button variant="outline" size="sm">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default UserHomePage;
