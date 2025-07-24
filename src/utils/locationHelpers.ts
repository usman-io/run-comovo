
// Helper function to convert coordinates to human-readable address
export const formatLocationForDisplay = async (location: string | { type: string; data: { lat: number; lng: number } }): Promise<string> => {
  // If it's already a string, return it directly
  if (typeof location === 'string') {
    return location;
  }

  // If it's an object with coordinates, try to get a human-readable address
  if (location?.type === 'point' && location.data) {
    const { lat, lng } = location.data;
    
    // Try to get a human-readable address using reverse geocoding
    try {
      // Use Nominatim (OpenStreetMap) free geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RunningApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the formatted address if available
      if (data.display_name) {
        return data.display_name;
      }
      
      // If no formatted address, try to construct one from address components
      if (data.address) {
        const { road, house_number, city, town, village, state, country } = data.address;
        const parts = [
          house_number,
          road,
          city || town || village,
          state,
          country
        ].filter(Boolean);
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
    
    // Fallback to coordinates if everything else fails
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  
  return 'Location not specified';
};

// Synchronous helper for immediate display (shows coordinates until async resolution)
export const formatLocationSync = (location: string | { type: string; data: { lat: number; lng: number } }): string => {
  // If it's already a string, return it directly
  if (typeof location === 'string') {
    return location;
  }
  
  // If it's an object with coordinates, return coordinates as fallback
  if (location?.type === 'point' && location.data) {
    const { lat, lng } = location.data;
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  
  return 'Location not specified';
};
