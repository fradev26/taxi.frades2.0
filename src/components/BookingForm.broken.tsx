import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { DateTimeSelector } from "@/components/ui/datetime-selector";
import { MapPin, Calendar, Clock, Info, Map, Loader2, User, Mail, Phone, Plus, X, ArrowLeft, ArrowRight, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { typedSupabase } from "@/lib/supabase-typed";
import { supabase } from "@/integrations/supabase/client";
import { validateBookingForm, sanitizeInput } from "@/utils/validation";
import { PAYMENT_METHODS } from "@/constants";
import { initializeGoogleMaps, waitForGoogleMapsAPI, isGoogleMapsAPILoaded } from "@/utils/googleMaps";
import { DistanceService } from "@/services/distanceService";
import { PricingService } from "@/services/pricingService";
import { PriceDisplay } from "@/components/PriceDisplay";
import { EnhancedPriceDisplay } from "@/components/EnhancedPriceDisplay";
import { VehicleSelector } from "@/components/VehicleSelector";

// Re-export all the types and constants from the original file
export interface BookingFormData {
  pickup: string;
  destination: string;
  stopover: string;
  stopovers: Stopover[];
  date: string;  
  time: string;
  paymentMethod: string;
  vehicleType: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface BookingFormProps {
  onBookingSuccess?: () => void;
  onBookingCancel?: () => void;
  showCancelButton?: boolean;
}

interface Stopover {
  id: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  duration?: number; // Duration in minutes
}

interface PriceBreakdown {
  base: number;
  distance: number;
  time: number;
  surcharges: number;
  total: number;
  currency: string;
  details: {
    distanceKm: number;
    durationMinutes: number;
    appliedSurcharges: Array<{
      name: string;
      amount: number;
      type: 'fixed' | 'percentage';
    }>;
  };
}

interface DistanceResult {
  distance: number;
  duration: number;
  route?: any;
}

interface Vehicle {
  id: string;
  name: string;
  description: string;
  capacity: number; 
  luggage: number;
  image?: string;
}

// Popular locations data
const POPULAR_LOCATIONS = [
  {
    name: "Brussels Airport (BRU)",
    address: "Brussels Airport, Zaventem, Belgium",
    icon: "✈️",
    coordinates: { lat: 50.9014, lng: 4.4844 }
  },
  {
    name: "Charleroi Airport (CRL)", 
    address: "Brussels South Charleroi Airport, Charleroi, Belgium",
    icon: "✈️",
    coordinates: { lat: 50.4592, lng: 4.4538 }
  },
  {
    name: "Brussels Central Station",
    address: "Brussels-Central, Brussels, Belgium", 
    icon: "🚂",
    coordinates: { lat: 50.8456, lng: 4.3571 }
  },
  {
    name: "Antwerp Central Station",
    address: "Antwerpen-Centraal, Antwerp, Belgium",
    icon: "🚂", 
    coordinates: { lat: 51.2172, lng: 4.4214 }
  },
  {
    name: "Grand Place Brussels",
    address: "Grand Place, Brussels, Belgium",
    icon: "🏛️",
    coordinates: { lat: 50.8467, lng: 4.3525 }
  },
  {
    name: "Brussels Expo",
    address: "Brussels Expo, Laeken, Belgium", 
    icon: "🏢",
    coordinates: { lat: 50.8953, lng: 4.3481 }
  }
];

// Helper function to validate coordinates
const validateCoordinates = (lat: any, lng: any): { lat: number; lng: number } | null => {
  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);
  
  if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
    return null;
  }
  
  return { lat: numLat, lng: numLng };
};

export const BookingForm = React.memo(function BookingForm({ onBookingSuccess, onBookingCancel, showCancelButton = false }: BookingFormProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});
  
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: "",
    destination: "",
    stopover: "",
    stopovers: [],
    date: "",
    time: "",
    paymentMethod: "",
    vehicleType: "standard",
    pickupLat: undefined,
    pickupLng: undefined,
    destinationLat: undefined,
    destinationLng: undefined,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  const [showStopover, setShowStopover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [pickupMarker, setPickupMarker] = useState<any>(null);
  const [destinationMarker, setDestinationMarker] = useState<any>(null);
  const [stopoverMarkers, setStopoverMarkers] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Address suggestions state
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showStopoverSuggestions, setShowStopoverSuggestions] = useState<Record<string, boolean>>({});
  const [googlePlacesPickupResults, setGooglePlacesPickupResults] = useState<any[]>([]);
  const [googlePlacesDestinationResults, setGooglePlacesDestinationResults] = useState<any[]>([]);
  const [googlePlacesStopoverResults, setGooglePlacesStopoverResults] = useState<Record<string, any[]>>({});
  
  // Pricing state
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  
  // Debounce refs for search
  const pickupSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form refs
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset payment method if user logs out and credit was selected
  useEffect(() => {
    if (!user && formData.paymentMethod === 'credit') {
      updateFormData('paymentMethod', 'direct');
    }
  }, [user, formData.paymentMethod]);

  // Cleanup search timeouts on unmount
  useEffect(() => {
    return () => {
      if (pickupSearchTimeoutRef.current) {
        clearTimeout(pickupSearchTimeoutRef.current);
      }
      if (destinationSearchTimeoutRef.current) {
        clearTimeout(destinationSearchTimeoutRef.current);
      }
    };
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    const setupGoogleMaps = async () => {
      if (!showMap) return;

      try {
        // Load Google Maps API if not already loaded
        if (!isGoogleMapsAPILoaded()) {
          await initializeGoogleMaps();
        }

        // Wait for API to be ready
        await waitForGoogleMapsAPI();
        
        setGoogleMapsLoaded(true);
        setupMapAndAutocomplete();
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        toast({
          title: "Kaart niet beschikbaar",
          description: "Google Maps kon niet worden geladen. Controleer uw internetverbinding en probeer opnieuw.",
          variant: "destructive",
        });
      }
    };

    const setupMapAndAutocomplete = () => {
      if (!window.google || !mapRef.current) return;

      // Initialize map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 50.8503, lng: 4.3517 }, // Brussels center
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      setMap(mapInstance);
    };

    setupGoogleMaps();
  }, [showMap, toast]);

  // Initialize Places service when map is ready
  useEffect(() => {
    if (map && googleMapsLoaded && window.google) {
      try {
        // Force Places service initialization
        const testService = new window.google.maps.places.PlacesService(map);
      } catch (error) {
        console.error('Failed to initialize Places service:', error);
      }
    }
  }, [map, googleMapsLoaded]);



  // Step validation functions
  const validateStep1 = (): string[] => {
    const errors: string[] = [];
    if (!formData.pickup.trim()) errors.push("Ophaaladres is verplicht");
    if (!formData.destination.trim()) errors.push("Bestemmingsadres is verplicht");
    if (!formData.date) errors.push("Datum is verplicht");
    if (!formData.time) errors.push("Tijd is verplicht");
    return errors;
  };

  const validateStep2 = (): string[] => {
    const errors: string[] = [];
    if (!formData.vehicleType) errors.push("Voertuigtype is verplicht");
    return errors;
  };

  const validateStep3 = (): string[] => {
    const errors: string[] = [];
    if (!formData.paymentMethod) errors.push("Betaalmethode is verplicht");
    
    if (!user && formData.paymentMethod !== 'invoice') {
      if (!formData.guestName?.trim()) errors.push("Naam is verplicht");
      if (!formData.guestEmail?.trim()) errors.push("E-mailadres is verplicht");
      if (!formData.guestPhone?.trim()) errors.push("Telefoonnummer is verplicht");
    }
    
    return errors;
  };

  const canProceedToStep = (step: number): boolean => {
    let errors: string[] = [];
    
    switch (step) {
      case 2:
        errors = validateStep1();
        break;
      case 3:
        errors = [...validateStep1(), ...validateStep2()];
        break;
      default:
        return true;
    }
    
    setStepErrors(prev => ({ ...prev, [step - 1]: errors }));
    return errors.length === 0;
  };

  const nextStep = () => {
    if (canProceedToStep(currentStep + 1)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Helper functions (simplified versions)
  const updateFormData = useCallback((field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate price based on distance and time
  const calculatePrice = useCallback(async (distanceKm: number, durationMinutes: number) => {
    setIsCalculatingPrice(true);
    setPriceError(null);

    try {
      const pricingService = new PricingService();
      const breakdown = await pricingService.calculatePrice({
        distance: distanceKm,
        duration: durationMinutes,
        vehicleType: formData.vehicleType,
        date: formData.date,
        time: formData.time,
        stopovers: formData.stopovers.length
      });
      
      setPriceBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating price:', error);
      setPriceError('Fout bij berekenen van de prijs');
    } finally {
      setIsCalculatingPrice(false);
    }
  }, [formData.vehicleType, formData.date, formData.time, formData.stopovers.length]);

  // Update route on map with working version from backup
  const updateRoute = useCallback((mapInstance?: any) => {
    const targetMap = mapInstance || map;
    if (!targetMap || !window.google) return;
    
    // Check if we have at least pickup and destination
    if (!formData.pickupLat || !formData.pickupLng || !formData.destinationLat || !formData.destinationLng) {
      // Clear existing route
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    // Initialize DirectionsRenderer if not exists
    let renderer = directionsRenderer;
    if (!renderer) {
      renderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We use custom markers
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      renderer.setMap(targetMap);
      setDirectionsRenderer(renderer);
    }

    // Prepare waypoints from stopovers
    const waypoints: any[] = [];
    
    // Add stopovers with coordinates
    formData.stopovers.forEach(stopover => {
      if (stopover.coordinates) {
        waypoints.push({
          location: new window.google.maps.LatLng(stopover.coordinates.lat, stopover.coordinates.lng),
          stopover: true
        });
      }
    });

    // Calculate route with traffic awareness
    const now = new Date();
    const scheduledDateTime = formData.date && formData.time ? 
      new Date(`${formData.date}T${formData.time}`) : now;
    
    const request = {
      origin: { lat: formData.pickupLat!, lng: formData.pickupLng! },
      destination: { lat: formData.destinationLat!, lng: formData.destinationLng! },
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
      drivingOptions: {
        departureTime: scheduledDateTime > now ? scheduledDateTime : now,
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS
      },
      unitSystem: window.google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        renderer.setDirections(result);
        
        // Calculate price based on route
        const route = result.routes[0];
        if (route && route.legs.length > 0) {
          let totalDistance = 0;
          let totalDuration = 0;
          
          route.legs.forEach((leg: any) => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });
          
          setDistanceResult({
            distance: totalDistance / 1000, // Convert to km
            duration: totalDuration / 60, // Convert to minutes
            route: result
          });
          
          // Calculate pricing
          calculatePrice(totalDistance / 1000, totalDuration / 60);
        }
      } else {
        console.warn('Directions request failed due to ' + status);
        // Fallback to basic route without traffic
        const basicRequest = {
          origin: { lat: formData.pickupLat!, lng: formData.pickupLng! },
          destination: { lat: formData.destinationLat!, lng: formData.destinationLng! },
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true
        };

        directionsService.route(basicRequest, (result: any, status: any) => {
          if (status === 'OK') {
            renderer.setDirections(result);
            
            // Calculate price based on route
            const route = result.routes[0];
            if (route && route.legs.length > 0) {
              let totalDistance = 0;
              let totalDuration = 0;
              
              route.legs.forEach((leg: any) => {
                totalDistance += leg.distance?.value || 0;
                totalDuration += leg.duration?.value || 0;
              });
              
              setDistanceResult({
                distance: totalDistance / 1000,
                duration: totalDuration / 60,
                route: result
              });
              
              calculatePrice(totalDistance / 1000, totalDuration / 60);
            }
          } else {
            console.warn('Basic directions request also failed due to ' + status);
            toast({
              title: "Route probleem",
              description: "Er kon geen route worden berekend tussen deze locaties.",
              variant: "destructive",
            });
          }
        });
      }
    });
  }, [map, formData.pickupLat, formData.pickupLng, formData.destinationLat, formData.destinationLng, formData.stopovers, formData.date, formData.time, directionsRenderer, toast, calculatePrice]);

  // Handle place selection
  const handlePlaceSelect = useCallback((place: any, type: 'pickup' | 'destination' | string) => {
    if (type === 'pickup') {
      updateFormData('pickup', place.address);
      updateFormData('pickupLat', place.coordinates?.lat);
      updateFormData('pickupLng', place.coordinates?.lng);
      setShowPickupSuggestions(false);
      
      // Update pickup marker
      if (map && place.coordinates) {
        if (pickupMarker) {
          pickupMarker.setMap(null);
        }
        const newPickupMarker = new window.google.maps.Marker({
          position: place.coordinates,
          map: map,
          title: 'Ophaaladres',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22c55e" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
        setPickupMarker(newPickupMarker);
      }
    } else if (type === 'destination') {
      updateFormData('destination', place.address);
      updateFormData('destinationLat', place.coordinates?.lat);
      updateFormData('destinationLng', place.coordinates?.lng);
      setShowDestinationSuggestions(false);
      
      // Update destination marker
      if (map && place.coordinates) {
        if (destinationMarker) {
          destinationMarker.setMap(null);
        }
        const newDestinationMarker = new window.google.maps.Marker({
          position: place.coordinates,
          map: map,
          title: 'Bestemming',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
        setDestinationMarker(newDestinationMarker);
      }
    } else if (typeof type === 'string' && type.startsWith('stopover-')) {
      // Handle stopover selection
      const stopoverIndex = formData.stopovers.findIndex(s => s.id === type);
      if (stopoverIndex !== -1) {
        const newStopovers = [...formData.stopovers];
        newStopovers[stopoverIndex] = {
          ...newStopovers[stopoverIndex],
          address: place.address,
          coordinates: place.coordinates
        };
        updateFormData('stopovers', newStopovers);
        
        setShowStopoverSuggestions(prev => ({ ...prev, [type]: false }));
        setGooglePlacesStopoverResults(prev => ({ ...prev, [type]: [] }));
        
        // Update stopover marker
        if (map && place.coordinates) {
          // Remove old marker if exists
          if (stopoverMarkers[stopoverIndex]) {
            stopoverMarkers[stopoverIndex].setMap(null);
          }
          
          const newStopoverMarker = new window.google.maps.Marker({
            position: place.coordinates,
            map: map,
            title: `Tussenstop ${stopoverIndex + 1}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#f97316" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
        
        // Update the markers array
        const newStopoverMarkers = [...stopoverMarkers];
        newStopoverMarkers[stopoverIndex] = newStopoverMarker;
        setStopoverMarkers(newStopoverMarkers);
        }
      }
    }

    // Update route if both addresses are set - using working method from backup
    if (formData.pickup && formData.destination && map && formData.pickupLat && formData.pickupLng && formData.destinationLat && formData.destinationLng) {
      updateRoute();
    }
  }, [map, pickupMarker, destinationMarker, stopoverMarkers, formData.pickup, formData.destination, formData.stopovers, formData.pickupLat, formData.pickupLng, formData.destinationLat, formData.destinationLng, updateFormData, updateRoute]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Locatie niet beschikbaar",
        description: "Uw browser ondersteunt geen geolocatie.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get readable address
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results: any, status: any) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                updateFormData('pickup', address);
                updateFormData('pickupLat', latitude);
                updateFormData('pickupLng', longitude);
                setShowPickupSuggestions(false);
                
                toast({
                  title: "Locatie gevonden",
                  description: "Uw huidige locatie is ingesteld als ophaaladres.",
                });
              } else {
                // Fallback to coordinates display
                updateFormData('pickup', 'Mijn huidige locatie');
                updateFormData('pickupLat', latitude);
                updateFormData('pickupLng', longitude);
                setShowPickupSuggestions(false);
              }
            });
          } else {
            updateFormData('pickup', 'Mijn huidige locatie');
            updateFormData('pickupLat', latitude);
            updateFormData('pickupLng', longitude);
            setShowPickupSuggestions(false);
          }
          
          // Update map and markers
          if (map) {
            const location = { lat: latitude, lng: longitude };
            map.setCenter(location);
            map.setZoom(15);
            
            // Add pickup marker
            if (pickupMarker) {
              pickupMarker.setMap(null);
            }
            const newPickupMarker = new window.google.maps.Marker({
              position: location,
              map: map,
              title: 'Ophaaladres',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22c55e" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32)
              }
            });
            setPickupMarker(newPickupMarker);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          updateFormData('pickup', 'Mijn huidige locatie');
          updateFormData('pickupLat', latitude);
          updateFormData('pickupLng', longitude);
          setShowPickupSuggestions(false);
        }
      },
      (error) => {
        toast({
          title: "Locatie fout",
          description: "Kon uw locatie niet bepalen. Controleer uw browser instellingen.",
          variant: "destructive",
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Google Places search function
  const searchGooglePlaces = useCallback(async (query: string, type: 'pickup' | 'destination' | string) => {
    if (!window.google || !query.trim()) return;
    if (!map) return;

    try {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        query: query,
        fields: ['name', 'formatted_address', 'geometry'],
        locationBias: new window.google.maps.Circle({
          center: { lat: 50.8503, lng: 4.3517 },
          radius: 50000
        })
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedResults = results.slice(0, 5).map(place => ({
            name: place.name || '',
            address: place.formatted_address || '',
            coordinates: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : null
          }));

          if (type === 'pickup') {
            setGooglePlacesPickupResults(formattedResults);
          } else if (type === 'destination') {
            setGooglePlacesDestinationResults(formattedResults);
          } else {
            // It's a stopover ID
            setGooglePlacesStopoverResults(prev => ({
              ...prev,
              [type]: formattedResults
            }));
          }
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log('No places found for query:', query);
          // Clear previous results
          if (type === 'pickup') {
            setGooglePlacesPickupResults([]);
          } else if (type === 'destination') {
            setGooglePlacesDestinationResults([]);
          } else {
            setGooglePlacesStopoverResults(prev => ({ ...prev, [type]: [] }));
          }
        } else {
          console.error('Places API error:', status);
          // Still clear results on error
          if (type === 'pickup') {
            setGooglePlacesPickupResults([]);
          } else if (type === 'destination') {
            setGooglePlacesDestinationResults([]);
          } else {
            setGooglePlacesStopoverResults(prev => ({ ...prev, [type]: [] }));
          }
        }
      });
    } catch (error) {
      console.error('Error searching places:', error);
    }
  }, [map]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const step3Errors = validateStep3();
    const allErrors = [...step1Errors, ...step2Errors, ...step3Errors];
    
    if (allErrors.length > 0) {
      toast({
        title: "Formulier incompleet",
        description: "Controleer alle velden en probeer opnieuw.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Your existing submission logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Placeholder
      
      toast({
        title: "Boeking voltooid!",
        description: "Je taxi is geboekt. Je ontvangt een bevestiging per e-mail.",
      });
      
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Boeking mislukt",
        description: "Er is een fout opgetreden bij het boeken van je rit. Probeer het opnieuw.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-semibold">Boek je rit</CardTitle>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step < currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 h-0.5 transition-colors ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Step titles */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
          <span className={currentStep === 1 ? 'text-primary font-medium' : ''}>Route & Tijd</span>
          <span className={currentStep === 2 ? 'text-primary font-medium' : ''}>Voertuig</span>
          <span className={currentStep === 3 ? 'text-primary font-medium' : ''}>Betaling</span>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Route & Time */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Route & Tijd</h3>
                <p className="text-sm text-muted-foreground">Waar wil je naartoe en wanneer?</p>
              </div>

              {/* Error display for step 1 */}
              {stepErrors[1] && stepErrors[1].length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                  <ul className="list-disc list-inside space-y-1">
                    {stepErrors[1].map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* From Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span>Ophaaladres</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCurrentLocation}
                    className="text-xs h-6 px-2 text-primary hover:text-primary-foreground hover:bg-primary"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Mijn locatie
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    ref={pickupInputRef}
                    placeholder="Adres, luchthaven, hotel, ..."
                    value={formData.pickup}
                    onChange={(e) => {
                      updateFormData('pickup', e.target.value);
                      const value = e.target.value;
                      if (value.length === 0) {
                        setShowPickupSuggestions(true);
                        setGooglePlacesPickupResults([]);
                      } else if (value.length >= 2) {
                        setShowPickupSuggestions(true);
                        // Debounce search
                        if (pickupSearchTimeoutRef.current) {
                          clearTimeout(pickupSearchTimeoutRef.current);
                        }
                        pickupSearchTimeoutRef.current = setTimeout(() => {
                          searchGooglePlaces(value, 'pickup');
                        }, 400);
                      } else {
                        setShowPickupSuggestions(false);
                        setGooglePlacesPickupResults([]);
                      }
                    }}
                    onFocus={() => {
                      if (formData.pickup.length === 0) {
                        setShowPickupSuggestions(true);
                      } else if (formData.pickup.length >= 2) {
                        setShowPickupSuggestions(true);
                        searchGooglePlaces(formData.pickup, 'pickup');
                      }
                    }}
                    onBlur={() => setTimeout(() => {
                      setShowPickupSuggestions(false);
                      setGooglePlacesPickupResults([]);
                    }, 300)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowPickupSuggestions(false);
                        setGooglePlacesPickupResults([]);
                      }
                    }}
                    className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    autoComplete="off"
                  />
                  
                  {/* Pickup Suggestions */}
                  {showPickupSuggestions && (googlePlacesPickupResults.length > 0 || formData.pickup.length === 0) && (
                    <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-xl border-2 border-primary/20 max-h-80 overflow-y-auto bg-background/95 backdrop-blur-sm">
                      <CardContent className="p-2">
                        {/* Current Location when empty */}
                        {formData.pickup.length === 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 mb-2 hover:bg-muted bg-primary/5 border border-primary/20"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCurrentLocation();
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-lg flex-shrink-0">📍</div>
                              <div>
                                <div className="font-medium text-sm text-primary">Mijn locatie</div>
                                <div className="text-xs text-muted-foreground">Gebruik huidige locatie</div>
                              </div>
                            </div>
                          </Button>
                        )}
                        
                        {/* Popular locations when empty */}
                        {formData.pickup.length === 0 && (
                          <>
                            <div className="text-xs text-muted-foreground mb-2 px-2 mt-3">Populaire locaties:</div>
                            {POPULAR_LOCATIONS.map((location, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePlaceSelect({
                                    name: location.name,
                                    address: location.address,
                                    coordinates: location.coordinates
                                  }, 'pickup');
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg flex-shrink-0">{location.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm">{location.name}</div>
                                    <div className="text-xs text-muted-foreground">{location.address}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </>
                        )}
                        
                        {/* Google Places results */}
                        {googlePlacesPickupResults.length > 0 && (
                          <>
                            {formData.pickup.length === 0 && <hr className="my-2" />}
                            <div className="text-xs text-muted-foreground mb-2 px-2">Zoekresultaten:</div>
                            {googlePlacesPickupResults.map((place, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePlaceSelect(place, 'pickup');
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">{place.name}</div>
                                    <div className="text-xs text-muted-foreground">{place.address}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* To Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span>Bestemmingsadres</span>
                </div>
                <div className="relative">
                  <Input
                    ref={destinationInputRef}
                    placeholder="Adres, luchthaven, hotel, ..."
                    value={formData.destination}
                    onChange={(e) => {
                      updateFormData('destination', e.target.value);
                      const value = e.target.value;
                      if (value.length === 0) {
                        setShowDestinationSuggestions(true);
                        setGooglePlacesDestinationResults([]);
                      } else if (value.length >= 2) {
                        setShowDestinationSuggestions(true);
                        // Debounce search
                        if (destinationSearchTimeoutRef.current) {
                          clearTimeout(destinationSearchTimeoutRef.current);
                        }
                        destinationSearchTimeoutRef.current = setTimeout(() => {
                          searchGooglePlaces(value, 'destination');
                        }, 400);
                      } else {
                        setShowDestinationSuggestions(false);
                        setGooglePlacesDestinationResults([]);
                      }
                    }}
                    onFocus={() => {
                      if (formData.destination.length === 0) {
                        setShowDestinationSuggestions(true);
                      } else if (formData.destination.length >= 2) {
                        setShowDestinationSuggestions(true);
                        searchGooglePlaces(formData.destination, 'destination');
                      }
                    }}
                    onBlur={() => setTimeout(() => {
                      setShowDestinationSuggestions(false);
                      setGooglePlacesDestinationResults([]);
                    }, 300)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowDestinationSuggestions(false);
                        setGooglePlacesDestinationResults([]);
                      }
                    }}
                    className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    autoComplete="off"
                  />
                  
                  {/* Destination Suggestions */}
                  {showDestinationSuggestions && (googlePlacesDestinationResults.length > 0 || formData.destination.length === 0) && (
                    <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-xl border-2 border-primary/20 max-h-80 overflow-y-auto bg-background/95 backdrop-blur-sm">
                      <CardContent className="p-2">
                        {/* Popular locations when empty */}
                        {formData.destination.length === 0 && (
                          <>
                            <div className="text-xs text-muted-foreground mb-2 px-2">Populaire locaties:</div>
                            {POPULAR_LOCATIONS.map((location, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePlaceSelect({
                                    name: location.name,
                                    address: location.address,
                                    coordinates: location.coordinates
                                  }, 'destination');
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg flex-shrink-0">{location.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm">{location.name}</div>
                                    <div className="text-xs text-muted-foreground">{location.address}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </>
                        )}
                        
                        {/* Google Places results */}
                        {googlePlacesDestinationResults.length > 0 && (
                          <>
                            {formData.destination.length === 0 && <hr className="my-2" />}
                            <div className="text-xs text-muted-foreground mb-2 px-2">Zoekresultaten:</div>
                            {googlePlacesDestinationResults.map((place, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePlaceSelect(place, 'destination');
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">{place.name}</div>
                                    <div className="text-xs text-muted-foreground">{place.address}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Stopovers */}
              {showStopover && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span>Tussenstops</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStopover(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.stopovers.map((stopover, index) => (
                    <div key={stopover.id} className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            placeholder={`Tussenstop ${index + 1}`}
                            value={stopover.address}
                            onChange={(e) => {
                              const newStopovers = [...formData.stopovers];
                              newStopovers[index] = { ...stopover, address: e.target.value };
                              updateFormData('stopovers', newStopovers);
                              
                              const value = e.target.value;
                              if (value.length >= 2) {
                                setShowStopoverSuggestions(prev => ({ ...prev, [stopover.id]: true }));
                                searchGooglePlaces(value, stopover.id);
                              } else {
                                setShowStopoverSuggestions(prev => ({ ...prev, [stopover.id]: false }));
                                setGooglePlacesStopoverResults(prev => ({ ...prev, [stopover.id]: [] }));
                              }
                            }}
                            onFocus={() => {
                              if (stopover.address.length >= 2) {
                                setShowStopoverSuggestions(prev => ({ ...prev, [stopover.id]: true }));
                                searchGooglePlaces(stopover.address, stopover.id);
                              }
                            }}
                            onBlur={() => setTimeout(() => {
                              setShowStopoverSuggestions(prev => ({ ...prev, [stopover.id]: false }));
                              setGooglePlacesStopoverResults(prev => ({ ...prev, [stopover.id]: [] }));
                            }, 200)}
                            className="flex-1"
                          />
                          
                          {/* Stopover Suggestions */}
                          {showStopoverSuggestions[stopover.id] && googlePlacesStopoverResults[stopover.id]?.length > 0 && (
                            <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-xl border-2 border-primary/20 max-h-60 overflow-y-auto bg-background/95 backdrop-blur-sm">
                              <CardContent className="p-2">
                                <div className="text-xs text-muted-foreground mb-2 px-2">Zoekresultaten:</div>
                                {googlePlacesStopoverResults[stopover.id].map((place, placeIndex) => (
                                  <Button
                                    key={placeIndex}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePlaceSelect(place, stopover.id);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      <div>
                                        <div className="font-medium text-sm">{place.name}</div>
                                        <div className="text-xs text-muted-foreground">{place.address}</div>
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStopovers = formData.stopovers.filter((_, i) => i !== index);
                            updateFormData('stopovers', newStopovers);
                            // Clean up suggestions state
                            setShowStopoverSuggestions(prev => {
                              const newState = { ...prev };
                              delete newState[stopover.id];
                              return newState;
                            });
                            setGooglePlacesStopoverResults(prev => {
                              const newState = { ...prev };
                              delete newState[stopover.id];
                              return newState;
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStopover = {
                        id: `stopover-${Date.now()}`,
                        address: "",
                        coordinates: undefined,
                        duration: undefined
                      };
                      updateFormData('stopovers', [...formData.stopovers, newStopover]);
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tussenstop toevoegen
                  </Button>
                </div>
              )}

              {!showStopover && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowStopover(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tussenstop toevoegen
                </Button>
              )}

              {/* Date & Time */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Datum en tijd
                </Label>
                <DateTimeSelector
                  selectedDate={formData.date ? new Date(formData.date + 'T' + (formData.time || '00:00')) : null}
                  selectedTime={formData.time}
                  onDateChange={(date) => {
                    if (date) {
                      const dateStr = date.toISOString().split('T')[0];
                      updateFormData('date', dateStr);
                    } else {
                      updateFormData('date', '');
                    }
                  }}
                  onTimeChange={(time) => updateFormData('time', time)}
                  minDate={new Date()}
                  showQuickActions={true}
                  timeStep={15}
                  placeholder={{
                    date: "Selecteer datum",
                    time: "Selecteer tijd"
                  }}
                />
              </div>

              {/* Map Container - only show if we have pickup or destination */}
              {(formData.pickup || formData.destination) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Map className="w-4 h-4" />
                    <span>Route overzicht</span>
                  </div>
                  <div className="relative w-full h-64 rounded-lg border overflow-hidden">
                    {!googleMapsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <p className="text-sm text-muted-foreground">Kaart wordt geladen...</p>
                        </div>
                      </div>
                    )}
                    <div 
                      ref={mapRef}
                      className="w-full h-full"
                      style={{ minHeight: '256px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Vehicle Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Kies je voertuig</h3>
                <p className="text-sm text-muted-foreground">Welk type voertuig heb je nodig?</p>
              </div>

              {/* Error display for step 2 */}
              {stepErrors[2] && stepErrors[2].length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                  <ul className="list-disc list-inside space-y-1">
                    {stepErrors[2].map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vehicle Selection */}
              <div className="space-y-4">
                {['standard', 'comfort', 'luxury', 'van'].map((vehicleType) => (
                  <div
                    key={vehicleType}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.vehicleType === vehicleType
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      updateFormData('vehicleType', vehicleType);
                      // Recalculate price with new vehicle type
                      if (distanceResult) {
                        calculatePrice(distanceResult.distance, distanceResult.duration);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5" />
                        <div>
                          <h4 className="font-medium capitalize">{vehicleType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {vehicleType === 'standard' && '4 passagiers, 2 koffers'}
                            {vehicleType === 'comfort' && '4 passagiers, 3 koffers'}
                            {vehicleType === 'luxury' && '4 passagiers, 3 koffers, premium'}
                            {vehicleType === 'van' && '8 passagiers, 6 koffers'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isCalculatingPrice ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Berekenen...</span>
                          </div>
                        ) : priceBreakdown ? (
                          <>
                            <div className="font-medium">
                              {priceBreakdown.total.toLocaleString('nl-NL', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {distanceResult ? `${distanceResult.distance.toFixed(1)} km` : 'geschat'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium">€--</div>
                            <div className="text-sm text-muted-foreground">Geen route</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Preview */}
              {priceBreakdown && (
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Totaalprijs</span>
                    <span className="text-lg font-bold">
                      {priceBreakdown.total.toLocaleString('nl-NL', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Betaling & Bevestiging</h3>
                <p className="text-sm text-muted-foreground">Kies je betaalmethode en voltooi je boeking</p>
              </div>

              {/* Error display for step 3 */}
              {stepErrors[3] && stepErrors[3].length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                  <ul className="list-disc list-inside space-y-1">
                    {stepErrors[3].map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Betaalmethode</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies betaalmethode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct betalen (card/bank)</SelectItem>
                    <SelectItem value="cash">Contant betalen</SelectItem>
                    {user && <SelectItem value="credit">Factuur (later betalen)</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {/* Guest Information (if not logged in) */}
              {!user && formData.paymentMethod !== 'invoice' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-medium">Je gegevens</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guestName" className="text-sm text-muted-foreground">
                      <User className="w-4 h-4 inline mr-2" />
                      Volledige naam
                    </Label>
                    <Input
                      id="guestName"
                      placeholder="Uw volledige naam"
                      value={formData.guestName || ""}
                      onChange={(e) => updateFormData('guestName', e.target.value)}
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestEmail" className="text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-mailadres
                    </Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="uw.email@voorbeeld.com"
                      value={formData.guestEmail || ""}
                      onChange={(e) => updateFormData('guestEmail', e.target.value)}
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestPhone" className="text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefoonnummer
                    </Label>
                    <PhoneInput
                      id="guestPhone"
                      value={formData.guestPhone || ""}
                      onChange={(value) => updateFormData('guestPhone', value)}
                      placeholder="123 456 789"
                      defaultCountry="BE"
                      variant="underline"
                    />
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              <div className="p-4 border rounded-lg bg-muted/5">
                <h4 className="font-medium mb-3">Boekingsoverzicht</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Van:</span>
                    <span className="font-medium">{formData.pickup || 'Niet ingevuld'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Naar:</span>
                    <span className="font-medium">{formData.destination || 'Niet ingevuld'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Datum:</span>
                    <span className="font-medium">{formData.date || 'Niet ingevuld'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tijd:</span>
                    <span className="font-medium">{formData.time || 'Niet ingevuld'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Voertuig:</span>
                    <span className="font-medium capitalize">{formData.vehicleType || 'Niet gekozen'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Totaal:</span>
                      <span>
                        {priceBreakdown 
                          ? priceBreakdown.total.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
                          : 'Wordt berekend...'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <Info className="w-3 h-3 inline mr-1" />
                Door te boeken ga je akkoord met onze algemene voorwaarden en privacybeleid.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Vorige
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1"
              >
                Volgende
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isSubmitting || isCalculatingPrice}
              >
                {isSubmitting 
                  ? "Boeken..." 
                  : priceBreakdown 
                  ? `Boek voor ${priceBreakdown.total.toLocaleString('nl-NL', {style: 'currency', currency: 'EUR'})}`
                  : "Boek rit"
                }
              </Button>
            )}
            
            {showCancelButton && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onBookingCancel}
                disabled={isSubmitting}
              >
                Annuleren
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
});