
/**
 * Determine pace category based on minutes per kilometer
 * 
 * @param pace - Minutes per kilometer
 * @param distance - Distance in kilometers
 * @returns Pace category string
 */
export function getPaceCategory(pace: number, distance: number = 0): 'beginner' | 'intermediate' | 'advanced' {
  if (pace >= 6.0) return 'beginner';
  if (pace >= 5.0 && pace < 6.0) return 'intermediate';
  if (pace < 5.0) return 'advanced';
  // Special case: Runs longer than 10km at under 6:00 min/km also count as advanced
  if (distance > 10 && pace < 6.0) return 'advanced';
  return 'beginner'; // Default fallback
}

/**
 * Format pace to display
 * 
 * @param pace - Minutes per kilometer as a number
 * @returns Formatted pace string (e.g., "5:30 min/km")
 */
export function formatPace(pace: number): string {
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
}

/**
 * Format date from ISO string to display date
 * 
 * @param dateStr - ISO date string
 * @returns Formatted date (e.g., "Sat, Jun 1")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Calculate remaining spots in a run
 * 
 * @param maxParticipants - Maximum number of participants
 * @param currentParticipants - Current number of participants
 * @returns Remaining spots
 */
export function getRemainingSpots(maxParticipants?: number, currentParticipants?: number): number | null {
  // If maxParticipants is null/undefined, it means unlimited spots
  if (maxParticipants === null || maxParticipants === undefined) return null;
  // If currentParticipants is undefined, assume 0
  const current = currentParticipants || 0;
  return maxParticipants - current;
}

/**
 * Check if a date is in the past
 * 
 * @param dateStr - ISO date string
 * @returns Boolean indicating if date is in the past
 */
export function isDatePast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if an event is in the future based on date and time
 * 
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @param timeStr - Time string (HH:MM)
 * @returns Boolean indicating if event is in the future
 */
export function isEventInFuture(dateStr: string, timeStr: string): boolean {
  const now = new Date();
  const eventDateTime = new Date(`${dateStr}T${timeStr}:00`);
  return eventDateTime > now;
}

/**
 * Group runs by date
 * 
 * @param runs - Array of run events
 * @returns Object with dates as keys and array of runs as values
 */
export function groupRunsByDate(runs: any[]): { [key: string]: any[] } {
  const grouped: { [key: string]: any[] } = {};
  
  runs.forEach(run => {
    // Format date for grouping (YYYY-MM-DD)
    const date = new Date(run.date);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(run);
  });
  
  return grouped;
}

/**
 * Get formatted date heading
 * 
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Formatted date heading
 */
export function getDateHeading(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  // Reset hours to compare dates properly
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Sort runs by proximity to a location
 * 
 * @param runs - Array of run events
 * @param userLat - User latitude
 * @param userLng - User longitude
 * @returns Sorted array of runs
 */
export function sortRunsByLocation(runs: any[], userLat?: number, userLng?: number): any[] {
  if (!userLat || !userLng) return runs;
  
  return [...runs].sort((a, b) => {
    // In a real app, these would be stored in the run object
    // For now we're using placeholders - in production this would use actual geocoded locations
    const aDistance = calculateDistance(userLat, userLng, a.latitude || 0, a.longitude || 0);
    const bDistance = calculateDistance(userLat, userLng, b.latitude || 0, b.longitude || 0);
    
    return aDistance - bDistance;
  });
}

/**
 * Filter runs based on filters
 */
export function filterRuns(runs: any[], filters: { 
  pace?: string[], 
  selectedDate?: Date,
  distance?: string[],
  location?: string,
  userLat?: number,
  userLng?: number
}) {
  let filteredRuns = runs.filter(run => {
    // Filter by pace
    if (filters.pace && filters.pace.length > 0) {
      // Recalculate pace category with distance to match new definition
      const paceCategory = getPaceCategory(run.pace, run.distance);
      if (!filters.pace.includes(paceCategory)) {
        return false;
      }
    }
    
    // Filter by specific date
    if (filters.selectedDate) {
      const runDate = new Date(run.date);
      const filterDate = new Date(filters.selectedDate);
      
      // Compare year, month, and day only
      if (
        runDate.getFullYear() !== filterDate.getFullYear() ||
        runDate.getMonth() !== filterDate.getMonth() ||
        runDate.getDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }
    
    // Filter by distance
    if (filters.distance && filters.distance.length > 0) {
      let matchesDistance = false;
      
      if (filters.distance.includes('short') && run.distance <= 5) {
        matchesDistance = true;
      } else if (filters.distance.includes('medium') && run.distance > 5 && run.distance <= 10) {
        matchesDistance = true;
      } else if (filters.distance.includes('long') && run.distance > 10) {
        matchesDistance = true;
      }
      
      if (!matchesDistance) {
        return false;
      }
    }
    
    // Filter by location
    if (filters.location && filters.location.trim() !== '') {
      const searchTerm = filters.location.toLowerCase().trim();
      const locationMatch = run.location.toLowerCase().includes(searchTerm) || 
                            run.address.toLowerCase().includes(searchTerm);
      if (!locationMatch) {
        return false;
      }
    }
    
    return true;
  });

  // Sort by location if coordinates are provided
  if (filters.userLat && filters.userLng) {
    filteredRuns = sortRunsByLocation(filteredRuns, filters.userLat, filters.userLng);
  }
  
  // Sort chronologically
  filteredRuns.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  
  return filteredRuns;
}
