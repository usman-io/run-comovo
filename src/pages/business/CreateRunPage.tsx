
import React from 'react';
import { Card } from '@/components/ui/card';
import CreateRunForm from '@/components/forms/CreateRunForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin } from 'lucide-react';

const CreateRunPage = () => {
  const navigate = useNavigate();

  const handleRunCreated = () => {
    toast.success('Run created successfully!');
    // Navigate with state to indicate a run was created
    navigate('/business/home', { state: { runCreated: true } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="app-container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Create a Run</h1>
          
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-blue-800 font-medium">Location Mapping</h3>
              <p className="text-blue-700 text-sm">
                Enter a complete address to automatically geocode it. This helps runners find your run location on the map.
              </p>
            </div>
          </div>
          
          <Card className="p-6">
            <CreateRunForm onRunCreated={handleRunCreated} />
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateRunPage;
