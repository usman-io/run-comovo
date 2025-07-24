
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User as AuthUser } from '@/contexts/auth/types';
import ProfileImageUpload from './ProfileImageUpload';

interface BusinessProfileCardProps {
  user: AuthUser;
}

const BusinessProfileCard: React.FC<BusinessProfileCardProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/business/profile');
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <ProfileImageUpload 
              currentImageUrl={user.profileImageUrl}
              className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{user?.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{user?.role}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Manage your business profile and updates</p>
            </div>
          </div>
          <Button 
            onClick={handleViewProfile}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
            size="sm"
          >
            View Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        {/* Show description on mobile below the main content */}
        <p className="text-xs text-gray-500 mt-3 sm:hidden">Manage your business profile and updates</p>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileCard;
