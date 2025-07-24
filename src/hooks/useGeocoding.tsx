
import { useState, useCallback } from 'react';

type GeocodeResult = {
  latitude: number | undefined;
  longitude: number | undefined;
  isLoading: boolean;
  error: string | null;
};

type CacheEntry = {
  timestamp: number;
  result: {
    latitude: number;
    longitude: number;
  };
};

// Simple in-memory cache with 1-hour TTL
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const geocodeCache = new Map<string, CacheEntry>();

// Helper function to clean up old cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of geocodeCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      geocodeCache.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupCache, CACHE_TTL);

export const useGeocoding = () => {
  const [result, setResult] = useState<GeocodeResult>({
    latitude: undefined,
    longitude: undefined,
    isLoading: false,
    error: null,
  });

  // Memoize the geocode function to prevent unnecessary re-renders
  const geocodeAddress = useCallback(async (address: string) => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setResult({
        latitude: undefined,
        longitude: undefined,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Check cache first
    const cached = geocodeCache.get(trimmedAddress);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log('Using cached geocoding result for:', trimmedAddress);
      setResult({
        latitude: cached.result.latitude,
        longitude: cached.result.longitude,
        isLoading: false,
        error: null,
      });
      return;
    }

    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Starting geocoding for address:', trimmedAddress);
      
      // Use Nominatim (OpenStreetMap) free geocoding service
      const encodedAddress = encodeURIComponent(trimmedAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RunningApp/1.0',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          // Add a small delay to respect Nominatim's usage policy
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding service error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Nominatim geocoding response:', data);

      if (data && data.length > 0) {
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        const result = { latitude, longitude };
        
        console.log(`Successfully geocoded "${trimmedAddress}" to:`, result);
        
        // Cache the successful result
        geocodeCache.set(trimmedAddress, {
          timestamp: now,
          result
        });
        
        setResult({
          ...result,
          isLoading: false,
          error: null,
        });
      } else {
        console.warn('No geocoding results found for:', trimmedAddress);
        setResult({
          latitude: undefined,
          longitude: undefined,
          isLoading: false,
          error: 'Address not found. Please enter a more specific address.',
        });
      }
      
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // If we have a cached result, use it even if it's expired
      if (cached) {
        console.log('Using expired cached result due to API error');
        setResult({
          latitude: cached.result.latitude,
          longitude: cached.result.longitude,
          isLoading: false,
          error: 'Using cached location - geocoding service temporarily unavailable',
        });
      } else {
        const errorMessage = error instanceof Error && error.message.includes('timeout') 
          ? 'Address lookup timed out. Please try again.'
          : 'Address not found. Please check the address and try again.';
        
        setResult({
          latitude: undefined,
          longitude: undefined,
          isLoading: false,
          error: errorMessage,
        });
      }
    }
  }, []);

  return {
    ...result,
    geocodeAddress,
  };
};
