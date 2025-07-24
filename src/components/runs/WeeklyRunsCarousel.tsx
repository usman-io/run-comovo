
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { runEventsService } from '@/services/runEventsService';
import { formatDate } from '@/utils/helpers';
import { RunEvent } from '@/types';
import { fileUploadApi } from '@/services/api/fileUploadService';
import { userImageService } from '@/services/userImageService';

interface RunCardProps {
  run: RunEvent;
}

const RunCard: React.FC<RunCardProps> = ({ run }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [hostImageUrl, setHostImageUrl] = useState<string>('');

  // Load image URL on component mount
  useEffect(() => {
    const loadImageUrl = async () => {
      setImageLoading(true);
      
      // If we have a direct image URL, use it
      if (run.imageUrl && run.imageUrl.trim() !== '' && run.imageUrl.startsWith('http')) {
        setImageUrl(run.imageUrl);
        setImageLoading(false);
        return;
      }
      
      // Try to get from Supabase using event ID
      const numericId = parseInt(run.id);
      if (!isNaN(numericId)) {
        const supabaseUrl = await fileUploadApi.getEventImageUrl(run.id);
        setImageUrl(supabaseUrl);
        setImageLoading(false);
        return;
      }
      
      // Fallback
      setImageUrl('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
      setImageLoading(false);
    };

    loadImageUrl();
  }, [run.imageUrl, run.id]);

  // Load host profile image
  useEffect(() => {
    const loadHostImage = async () => {
      if (run.hostId) {
        const hostImageUrl = await userImageService.getProfileImageUrlAsync(run.hostId);
        setHostImageUrl(hostImageUrl);
      }
    };

    loadHostImage();
  }, [run.hostId]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallbackUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    if (target.src !== fallbackUrl) {
      target.src = fallbackUrl;
    }
  }, []);

  return (
    <Link to={`/runs/${run.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
        <div className="aspect-[4/3] relative">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={run.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
          <div className="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/60 to-transparent">
            <Badge
              className={
                run.paceCategory === 'beginner' 
                  ? 'badge-beginner' 
                  : run.paceCategory === 'intermediate' 
                  ? 'badge-intermediate' 
                  : 'badge-advanced'
              }
            >
              {run.paceCategory}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1 pr-2">{run.title}</h3>
              <div className="text-sm font-semibold text-primary">{run.distance} km</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formatDate(run.date)} • {run.time}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{run.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={hostImageUrl} alt={run.hostName} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Hosted by</span>
                  <span className="text-sm font-medium">{run.hostName}</span>
                </div>
              </div>
              
              <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                Join Run
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const WeeklyRunsCarousel: React.FC = () => {
  // Use the same query key and settings as RunsPage to share cache
  const { data: allRuns = [], isLoading } = useQuery<RunEvent[]>({
    queryKey: ['runs'], // Same key as RunsPage
    queryFn: runEventsService.getAllEvents,
    staleTime: 10 * 60 * 1000, // 10 minutes - same as RunsPage
    gcTime: 30 * 60 * 1000, // 30 minutes - same as RunsPage
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error && error.toString().includes('429')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 5000,
  });

  // Memoize upcoming runs calculation
  const upcomingRuns = useMemo(() => {
    return allRuns
      .filter(run => new Date(run.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6); // Limit to 6 runs for grid display
  }, [allRuns]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingRuns.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No upcoming runs</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new running events.
          </p>
          <Link to="/runs">
            <Button>Find Runs</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {upcomingRuns.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  );
};

export default WeeklyRunsCarousel;
