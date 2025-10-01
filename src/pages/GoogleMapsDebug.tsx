/**
 * Google Maps Debug Page
 * 
 * Debug page for testing Google Maps API integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Navigation } from '@/components/Navigation';
import { GoogleMapsDebugPanel } from '@/hooks/useGoogleMapsDebug';
import { initializeGoogleMaps, isGoogleMapsAPILoaded } from '@/utils/googleMaps';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function GoogleMapsDebug() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const testGoogleMapsAPI = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('Testing Google Maps API...');
      
      // Try to initialize Google Maps
      await initializeGoogleMaps();
      
      // Check if API is loaded
      if (isGoogleMapsAPILoaded()) {
        setTestResult({
          success: true,
          message: 'Google Maps API loaded successfully!'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Google Maps API failed to load',
          error: 'API not accessible after initialization'
        });
      }
    } catch (error) {
      console.error('Google Maps test failed:', error);
      setTestResult({
        success: false,
        message: 'Google Maps API test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Google Maps Debug</h1>
            <p className="text-muted-foreground">
              Debug en test de Google Maps API integratie
            </p>
          </div>

          {/* Debug Info Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Status Informatie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleMapsDebugPanel />
            </CardContent>
          </Card>

          {/* Test Section */}
          <Card>
            <CardHeader>
              <CardTitle>API Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testGoogleMapsAPI}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Google Maps API'}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {testResult.success ? 'Success' : 'Error'}
                  </AlertTitle>
                  <AlertDescription>
                    {testResult.message}
                    {testResult.error && (
                      <div className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                        {testResult.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variabelen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>VITE_GOOGLE_MAPS_API_KEY:</strong>
                  </div>
                  <div className="font-mono">
                    {import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
                      ? `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10)}...`
                      : 'Not set'
                    }
                  </div>
                </div>
                
                <Alert variant="default">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Configuratie Info</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>De API key moet beginnen met "AIza" en 39 karakters lang zijn</li>
                      <li>Zorg ervoor dat de volgende APIs zijn ingeschakeld in Google Cloud Console:</li>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Maps JavaScript API</li>
                        <li>Places API</li>
                        <li>Geocoding API</li>
                        <li>Directions API</li>
                      </ul>
                      <li>Controleer dat de API key geen restricties heeft die de ontwikkelingsdomein blokkeren</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}