
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi } from '@/services/api';
import { XanoEvent } from '@/services/api/types';
import { toast } from 'sonner';

interface BusinessUpcomingEventsProps {
  businessId: string;
}

const BusinessUpcomingEvents: React.FC<BusinessUpcomingEventsProps> = ({ businessId }) => {
  const [events, setEvents] = useState<XanoEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [businessId]);

  const fetchUpcomingEvents = async () => {
    setIsLoading(true);
    try {
      const allEvents = await eventsApi.getEvents();
      // Filter events for this business and only upcoming ones
      const upcomingEvents = allEvents
        .filter(event => event.business_id === Number(businessId))
        .filter(event => event.event_start > Date.now())
        .sort((a, b) => a.event_start - b.event_start);
      
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      toast.error('Failed to load upcoming events');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPace = (paceSecondsPerKm: number) => {
    const minutes = Math.floor(paceSecondsPerKm / 60);
    const seconds = paceSecondsPerKm % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading upcoming events...</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
          <p className="text-gray-600 mb-4">
            Create your next community run to engage with your audience!
          </p>
          <Button asChild>
            <Link to="/business/create-run">Create New Run</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.event_start)}
                    </span>
                    {event.event_address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.event_address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Upcoming</Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/runs/${event.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{event.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.distance} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatPace(event.pace_seconds_per_km)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Max {event.max_participants || 'Unlimited'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/runs/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessUpcomingEvents;
