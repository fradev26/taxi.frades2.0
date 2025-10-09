import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeGoogleMaps, waitForGoogleMapsAPI, isGoogleMapsAPILoaded } from '@/utils/googleMaps';

interface UseGoogleMapsOptions {
  enabled?: boolean;
  onMapReady?: (map: google.maps.Map) => void;
  onError?: (error: Error) => void;
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const { enabled = true, onMapReady, onError } = options;
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);

  const loadGoogleMaps = useCallback(async () => {
    if (!enabled || isLoaded || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load Google Maps API if not already loaded
      if (!isGoogleMapsAPILoaded()) {
        await initializeGoogleMaps();
      }

      // Wait for API to be ready
      await waitForGoogleMapsAPI();
      
      setIsLoaded(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load Google Maps');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoaded, isLoading, onError]);

  const initializeMap = useCallback((mapElement: HTMLDivElement, options?: google.maps.MapOptions) => {
    if (!isLoaded || !window.google) {
      console.warn('Google Maps API not loaded yet');
      return null;
    }

    const defaultOptions: google.maps.MapOptions = {
      center: { lat: 50.8503, lng: 4.3517 }, // Brussels center
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      ...options
    };

    const newMap = new window.google.maps.Map(mapElement, defaultOptions);
    setMap(newMap);
    onMapReady?.(newMap);
    
    return newMap;
  }, [isLoaded, onMapReady]);

  const createAutocomplete = useCallback((
    input: HTMLInputElement, 
    options?: google.maps.places.AutocompleteOptions
  ) => {
    if (!isLoaded || !window.google?.maps?.places) {
      return null;
    }

    const defaultOptions: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: ['be', 'nl', 'fr', 'de', 'lu'] },
      fields: ['place_id', 'geometry', 'name', 'formatted_address'],
      types: ['establishment', 'geocode'],
      ...options
    };

    return new window.google.maps.places.Autocomplete(input, defaultOptions);
  }, [isLoaded]);

  const createMarker = useCallback((options: google.maps.MarkerOptions) => {
    if (!isLoaded || !window.google) {
      return null;
    }

    return new window.google.maps.Marker(options);
  }, [isLoaded]);

  const createDirectionsService = useCallback(() => {
    if (!isLoaded || !window.google) {
      return null;
    }

    return new window.google.maps.DirectionsService();
  }, [isLoaded]);

  const createDirectionsRenderer = useCallback((options?: google.maps.DirectionsRendererOptions) => {
    if (!isLoaded || !window.google) {
      return null;
    }

    return new window.google.maps.DirectionsRenderer(options);
  }, [isLoaded]);

  // Auto-load when enabled
  useEffect(() => {
    if (enabled) {
      loadGoogleMaps();
    }
  }, [enabled, loadGoogleMaps]);

  // Auto-initialize map when loaded and ref is available
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      initializeMap(mapRef.current);
    }
  }, [isLoaded, map, initializeMap]);

  return {
    // State
    isLoaded,
    isLoading,
    error,
    map,
    mapRef,
    
    // Methods
    loadGoogleMaps,
    initializeMap,
    createAutocomplete,
    createMarker,
    createDirectionsService,
    createDirectionsRenderer,
    
    // Utilities
    isReady: isLoaded && !isLoading && !error,
  };
}