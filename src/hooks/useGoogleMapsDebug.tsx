/**
 * Google Maps Debug Hook
 * 
 * Hook for debugging Google Maps API configuration and status
 */

import { useState, useEffect } from 'react';
import { getGoogleMapsConfig, isGoogleMapsAPILoaded } from '@/utils/googleMaps';

interface GoogleMapsDebugInfo {
  apiKeyConfigured: boolean;
  apiKeyValid: boolean;
  apiLoaded: boolean;
  windowGoogleExists: boolean;
  configError: string | null;
  apiKey: string | null;
}

export const useGoogleMapsDebug = () => {
  const [debugInfo, setDebugInfo] = useState<GoogleMapsDebugInfo>({
    apiKeyConfigured: false,
    apiKeyValid: false,
    apiLoaded: false,
    windowGoogleExists: false,
    configError: null,
    apiKey: null,
  });

  useEffect(() => {
    const checkGoogleMapsStatus = () => {
      let configError = null;
      let apiKey = null;
      let apiKeyConfigured = false;
      let apiKeyValid = false;

      try {
        const config = getGoogleMapsConfig();
        apiKey = config.apiKey;
        apiKeyConfigured = !!apiKey;
        
        // Basic API key validation
        apiKeyValid = apiKey ? /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey) : false;
      } catch (error) {
        configError = error instanceof Error ? error.message : 'Unknown configuration error';
        
        // Try to get API key directly from environment for debugging
        try {
          if (typeof window !== 'undefined' && import.meta?.env) {
            apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
            apiKeyConfigured = !!apiKey;
            apiKeyValid = apiKey ? /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey) : false;
          }
        } catch (directError) {
          // Ignore direct access errors
        }
      }

      setDebugInfo({
        apiKeyConfigured,
        apiKeyValid,
        apiLoaded: isGoogleMapsAPILoaded(),
        windowGoogleExists: !!window.google,
        configError,
        apiKey: apiKeyConfigured ? `${apiKey?.substring(0, 10)}...` : null,
      });
    };

    // Initial check
    checkGoogleMapsStatus();

    // Check periodically for status changes
    const interval = setInterval(checkGoogleMapsStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return debugInfo;
};

/**
 * Google Maps Debug Component
 */
export const GoogleMapsDebugPanel = () => {
  const debugInfo = useGoogleMapsDebug();

  return (
    <div className="p-4 bg-muted/50 rounded-lg text-sm">
      <h3 className="font-semibold mb-2">Google Maps Debug Info</h3>
      <div className="space-y-1">
        <div className={`flex justify-between ${debugInfo.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
          <span>API Key Configured:</span>
          <span>{debugInfo.apiKeyConfigured ? '✓' : '✗'}</span>
        </div>
        <div className={`flex justify-between ${debugInfo.apiKeyValid ? 'text-green-600' : 'text-red-600'}`}>
          <span>API Key Valid Format:</span>
          <span>{debugInfo.apiKeyValid ? '✓' : '✗'}</span>
        </div>
        <div className={`flex justify-between ${debugInfo.apiLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
          <span>API Loaded:</span>
          <span>{debugInfo.apiLoaded ? '✓' : '○'}</span>
        </div>
        <div className={`flex justify-between ${debugInfo.windowGoogleExists ? 'text-green-600' : 'text-yellow-600'}`}>
          <span>Window.google Exists:</span>
          <span>{debugInfo.windowGoogleExists ? '✓' : '○'}</span>
        </div>
        {debugInfo.apiKey && (
          <div className="flex justify-between text-muted-foreground">
            <span>API Key:</span>
            <span className="font-mono">{debugInfo.apiKey}</span>
          </div>
        )}
        {debugInfo.configError && (
          <div className="text-red-600 mt-2">
            <strong>Error:</strong> {debugInfo.configError}
          </div>
        )}
      </div>
    </div>
  );
};