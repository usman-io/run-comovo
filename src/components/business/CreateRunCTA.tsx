
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

const CreateRunCTA: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="lg:col-span-2 bg-pacers-blue text-white">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Ready to create a new community run?</h2>
            <p className="opacity-90 mt-1">
              Pick a date, time, and pace. We'll generate a shareable event page.
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => navigate('/business/create-run')}
            className="whitespace-nowrap bg-white hover:bg-white/90 text-pacers-blue"
          >
            <CalendarPlus className="mr-2 h-4 w-4" /> Create New Run
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateRunCTA;
