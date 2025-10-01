/**
 * Google Maps API Loader Utility
 * 
 * Handles dynamic loading of Google Maps JavaScript API
 * with proper configuration and error handling.
 */

interface GoogleMapsConfig {
  apiKey: string;
  libraries?: string[];
  language?: string;
  region?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let googleMapsPromise: Promise<void> | null = null;

/**
 * Load Google Maps API dynamically
 */
export const loadGoogleMapsAPI = (config: GoogleMapsConfig): Promise<void> => {
  // Return existing promise if already loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Return resolved promise if already loaded
  if (isGoogleMapsLoaded && window.google) {
    return Promise.resolve();
  }

  // Prevent multiple simultaneous loads
  if (isGoogleMapsLoading) {
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (isGoogleMapsLoaded && window.google) {
          resolve();
        } else if (!isGoogleMapsLoading) {
          reject(new Error('Google Maps failed to load'));
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  }

  isGoogleMapsLoading = true;

  googleMapsPromise = new Promise((resolve, reject) => {
    try {
      // Check if API key is provided
      if (!config.apiKey) {
        throw new Error('Google Maps API key is required');
      }

      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;

      // Build API URL with parameters
      const params = new URLSearchParams({
        key: config.apiKey,
        libraries: (config.libraries || ['places', 'geometry']).join(','),
        callback: 'initGoogleMaps',
        ...(config.language && { language: config.language }),
        ...(config.region && { region: config.region }),
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

      // Set up callback function
      window.initGoogleMaps = () => {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        console.log('Google Maps API loaded successfully');
        resolve();
      };

      // Handle script load errors
      script.onerror = () => {
        isGoogleMapsLoading = false;
        googleMapsPromise = null;
        const error = new Error('Failed to load Google Maps API script');
        console.error('Google Maps API load error:', error);
        reject(error);
      };

      // Add script to document
      document.head.appendChild(script);

      // Set timeout for loading
      setTimeout(() => {
        if (!isGoogleMapsLoaded) {
          isGoogleMapsLoading = false;
          googleMapsPromise = null;
          const error = new Error('Google Maps API load timeout');
          console.error('Google Maps API load timeout');
          reject(error);
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      isGoogleMapsLoading = false;
      googleMapsPromise = null;
      console.error('Google Maps API load setup error:', error);
      reject(error);
    }
  });

  return googleMapsPromise;
};

/**
 * Check if Google Maps API is loaded
 */
export const isGoogleMapsAPILoaded = (): boolean => {
  return isGoogleMapsLoaded && !!window.google?.maps;
};

/**
 * Wait for Google Maps API to be ready
 */
export const waitForGoogleMapsAPI = (): Promise<void> => {
  if (isGoogleMapsAPILoaded()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds

    const checkAPI = () => {
      attempts++;
      
      if (isGoogleMapsAPILoaded()) {
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Google Maps API not available after waiting'));
      } else {
        setTimeout(checkAPI, 100);
      }
    };

    checkAPI();
  });
};

/**
 * Get Google Maps configuration from environment
 */
export const getGoogleMapsConfig = (): GoogleMapsConfig => {
  // Try to get API key from environment
  let apiKey = '';
  
  try {
    // Check if we're in a Vite environment (browser)
    if (typeof window !== 'undefined' && import.meta?.env) {
      apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    }
    // Fallback for Node.js environment
    else if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';
    }
  } catch (error) {
    console.warn('Failed to access environment variables:', error);
  }
  
  if (!apiKey) {
    throw new Error('VITE_GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    libraries: ['places', 'geometry', 'drawing'],
    language: 'nl', // Dutch
    region: 'BE', // Belgium
  };
};

/**
 * Initialize Google Maps with default configuration
 */
export const initializeGoogleMaps = async (): Promise<void> => {
  try {
    const config = getGoogleMapsConfig();
    await loadGoogleMapsAPI(config);
    console.log('Google Maps initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error);
    throw error;
  }
};