import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowUp, Search, CalendarIcon } from 'lucide-react';
import { useGeocoding } from '@/hooks/useGeocoding';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RunFiltersProps {
  onFilterChange: (filters: any) => void;
}

const RunFilters: React.FC<RunFiltersProps> = ({
  onFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    pace: [] as string[],
    distance: [] as string[],
    selectedDate: undefined as Date | undefined,
    location: ''
  });

  const {
    latitude,
    longitude,
    isLoading: isGeocodingLoading,
    geocodeAddress
  } = useGeocoding();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.location.trim()) {
        geocodeAddress(filters.location);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.location, geocodeAddress]);

  useEffect(() => {
    const updatedFilters = {
      ...filters,
      userLat: latitude,
      userLng: longitude
    };
    onFilterChange(updatedFilters);
  }, [latitude, longitude, filters, onFilterChange]);

  const handlePaceChange = (pace: string, checked: boolean) => {
    const newPaceFilters = checked ? [...filters.pace, pace] : filters.pace.filter(p => p !== pace);
    const updatedFilters = {
      ...filters,
      pace: newPaceFilters
    };
    setFilters(updatedFilters);
  };

  const handleDistanceChange = (distance: string, checked: boolean) => {
    const newDistanceFilters = checked ? [...filters.distance, distance] : filters.distance.filter(d => d !== distance);
    const updatedFilters = {
      ...filters,
      distance: newDistanceFilters
    };
    setFilters(updatedFilters);
  };

  const handleDateChange = (date: Date | undefined) => {
    const updatedFilters = {
      ...filters,
      selectedDate: date
    };
    setFilters(updatedFilters);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFilters = {
      ...filters,
      location: e.target.value
    };
    setFilters(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      pace: [] as string[],
      distance: [] as string[],
      selectedDate: undefined,
      location: ''
    };
    setFilters(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Filters</h2>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-sm">
          {isExpanded ? 'Collapse' : 'Expand'}
          <ArrowUp className={`ml-1 h-4 w-4 ${isExpanded ? 'rotate-180' : ''} transition-transform`} />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 md:gap-6">
        {/* Location filter - always visible */}
        <div className="w-full relative">
          <Label htmlFor="location">Location (nearest first)</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="location" placeholder="Search by location or address" value={filters.location} onChange={handleLocationChange} className="pl-9 input-shadow" />
            {isGeocodingLoading && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>}
          </div>
          {latitude && longitude && <p className="text-xs text-muted-foreground mt-1">
              Showing runs closest to your location first
            </p>}
        </div>
        
        {/* Date filter - always visible with calendar */}
        <div className="w-full md:w-auto md:flex-1">
          <Label htmlFor="date-filter" className="mb-1 block">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date-filter" variant="outline" className={cn("w-full justify-start text-left font-normal input-shadow", !filters.selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.selectedDate ? format(filters.selectedDate, "PPP") : <span>Select a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filters.selectedDate} onSelect={handleDateChange} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Expandable filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pace filter */}
            <div>
              <Label className="mb-2 block">Pace</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="beginner" checked={filters.pace.includes('beginner')} onCheckedChange={checked => handlePaceChange('beginner', checked as boolean)} />
                  <Label htmlFor="beginner" className="text-sm cursor-pointer">Beginner (6:00+ min/km)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="intermediate" checked={filters.pace.includes('intermediate')} onCheckedChange={checked => handlePaceChange('intermediate', checked as boolean)} />
                  <Label htmlFor="intermediate" className="text-sm cursor-pointer">Intermediate (5:00-6:00 min/km)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="advanced" checked={filters.pace.includes('advanced')} onCheckedChange={checked => handlePaceChange('advanced', checked as boolean)} />
                  <Label htmlFor="advanced" className="text-sm cursor-pointer">Advanced (below 5:00 min/km or long runs)</Label>
                </div>
              </div>
            </div>
            
            {/* Distance filter */}
            <div>
              <Label className="mb-2 block">Distance</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="short" checked={filters.distance.includes('short')} onCheckedChange={checked => handleDistanceChange('short', checked as boolean)} />
                  <Label htmlFor="short" className="text-sm cursor-pointer">
                    Short (0-5 km)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="medium" checked={filters.distance.includes('medium')} onCheckedChange={checked => handleDistanceChange('medium', checked as boolean)} />
                  <Label htmlFor="medium" className="text-sm cursor-pointer">
                    Medium (5-10 km)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="long" checked={filters.distance.includes('long')} onCheckedChange={checked => handleDistanceChange('long', checked as boolean)} />
                  <Label htmlFor="long" className="text-sm cursor-pointer">
                    Long (10+ km)
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Clear filters button */}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={clearFilters} className="text-sm">
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunFilters;
