import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { DateTimeSelector } from "@/components/ui/datetime-selector";
import { MapPin, Calendar, Clock, Info, Map, Loader2, User, Mail, Phone, Plus, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { BookingWizard } from "@/components/ui/booking-wizard";
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
import { AddStopoverButton, RouteCalculatingState, MapLoadingOverlay } from "@/components/LoadingStates";
import type { BookingFormData, Stopover } from "@/types";
import type { PriceBreakdown } from "@/services/pricingService";
import type { DistanceResult } from "@/services/distanceService";
import { VehicleSelector } from "@/components/VehicleSelector";
import { STANDARD_VEHICLES } from "@/config/vehicles";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface Vehicle {
  id: string;
  type: string;
  name: string;
}

interface BookingFormProps {
  onBookingSuccess?: () => void;
  onBookingCancel?: () => void;
  showCancelButton?: boolean;
}

// Preset locations for quick selection
const PRESET_LOCATIONS = [
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
    stopover: "", // Keep for backwards compatibility
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
  const [stopoverMarker, setStopoverMarker] = useState<any>(null);
  const [stopoverMarkers, setStopoverMarkers] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Address suggestions state
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [googlePlacesPickupResults, setGooglePlacesPickupResults] = useState<any[]>([]);
  const [googlePlacesDestinationResults, setGooglePlacesDestinationResults] = useState<any[]>([]);
  
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
  const stopoverRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Step validation functions
  const validateStep1 = (data = formData): boolean => {
    return !!(
      data.pickup?.trim() &&
      data.destination?.trim() &&
      data.date &&
      data.time
    );
  };

  const validateStep2 = (data = formData): boolean => {
    return !!(data.vehicleType && data.paymentMethod);
  };

  const validateStep3 = (data = formData): boolean => {
    const hasPaymentMethod = !!data.paymentMethod;
    const hasGuestInfo = user || (
      data.guestName?.trim() &&
      data.guestEmail?.trim() &&
      data.guestPhone?.trim()
    );
    return !!(hasPaymentMethod && hasGuestInfo);
  };



  // Calculate completed steps
  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    if (validateStep1()) completed.push(1);
    if (validateStep2()) completed.push(2);
    if (validateStep3()) completed.push(3);
    return completed;
  }, [validateStep1, validateStep2, validateStep3]);

  // Check if we can proceed to next step
  const canProceedToStep = useCallback((step: number) => {
    switch (step) {
      case 2: return validateStep1();
      case 3: return validateStep2();
      default: return false;
    }
  }, [validateStep1, validateStep2]);

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
  
  const stopoverInputRef = useRef<HTMLInputElement>(null);

  // Stopover management functions
  const addStopover = useCallback(() => {
    const newStopover = {
      id: `stopover-${Date.now()}`,
      address: "",
      coordinates: undefined,
      duration: undefined
    };
    
    setFormData(prev => ({
      ...prev,
      stopovers: [...prev.stopovers, newStopover]
    }));

    // Add new ref for the new stopover
    const newRef = React.createRef<HTMLInputElement>();
    stopoverRefs.current = [...stopoverRefs.current, newRef];
  }, []);

  const removeStopover = useCallback((id: string) => {
    const stopoverIndex = formData.stopovers.findIndex(s => s.id === id);
    if (stopoverIndex === -1) return;

    // Remove marker if exists
    if (stopoverMarkers[stopoverIndex]) {
      stopoverMarkers[stopoverIndex].setMap(null);
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      stopovers: prev.stopovers.filter(s => s.id !== id)
    }));

    // Update markers array
    setStopoverMarkers(prev => prev.filter((_, index) => index !== stopoverIndex));
    
    // Update refs array
    stopoverRefs.current = stopoverRefs.current.filter((_, index) => index !== stopoverIndex);

    // Update route
    if (map) updateRoute(map);
  }, [formData.stopovers, stopoverMarkers, map]);

  const updateStopover = useCallback((id: string, updates: Partial<Stopover>) => {
    setFormData(prev => ({
      ...prev,
      stopovers: prev.stopovers.map(stopover => 
        stopover.id === id ? { ...stopover, ...updates } : stopover
      )
    }));
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

      // Note: We're not using Google's autocomplete widget anymore
      // Instead we use our custom search with their Places API

      // Note: We're not using Google's autocomplete widget for destination either
      // Using our custom search for consistent UI

      // Initialize autocomplete for stopover
      if (stopoverInputRef.current) {
        const stopoverAutocomplete = new window.google.maps.places.Autocomplete(
          stopoverInputRef.current,
          {
            componentRestrictions: { country: "be" },
            fields: ["formatted_address", "geometry", "name"]
          }
        );

        stopoverAutocomplete.addListener("place_changed", () => {
          const place = stopoverAutocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Validate coordinates
            const validCoords = validateCoordinates(lat, lng);
            if (!validCoords) {
          console.warn('Invalid coordinates received from Google Maps');
          return;
            }
            
            setFormData(prev => ({
          ...prev,
          stopover: place.formatted_address || place.name || "",
            }));

            // Update stopover marker
            if (stopoverMarker) {
          stopoverMarker.setMap(null);
            }
            const newStopoverMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          title: "Tussenstop",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }
            });
            setStopoverMarker(newStopoverMarker);
            
            // Update route
            updateRoute(mapInstance);
          }
        });
      }

      // Initialize autocomplete for multiple stopovers
      setupStopoverAutocompletes(mapInstance);
    };

    // Setup autocomplete for all stopovers
    const setupStopoverAutocompletes = (mapInstance: any) => {
      formData.stopovers.forEach((stopover, index) => {
        const inputRef = stopoverRefs.current[index];
        if (inputRef && inputRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              componentRestrictions: { country: "be" },
              fields: ["formatted_address", "geometry", "name"]
            }
          );

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              // Validate coordinates
              const validCoords = validateCoordinates(lat, lng);
              if (!validCoords) {
                console.warn('Invalid coordinates received from Google Maps');
                return;
              }
              
              // Update stopover data
              updateStopover(stopover.id, {
                address: place.formatted_address || place.name || "",
                coordinates: validCoords
              });

              // Update or create marker
              updateStopoverMarker(index, validCoords, mapInstance);
              
              // Update route
              updateRoute(mapInstance);
            }
          });
        }
      });
    };

    setupGoogleMaps();
  }, [showMap]);

  // Update or create stopover marker
  const updateStopoverMarker = (index: number, coordinates: { lat: number; lng: number }, mapInstance: any) => {
    // Remove existing marker if it exists
    if (stopoverMarkers[index]) {
      stopoverMarkers[index].setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: coordinates,
      map: mapInstance,
      title: `Tussenstop ${index + 1}`,
      label: {
        text: (index + 1).toString(),
        color: "white",
        fontSize: "12px",
        fontWeight: "bold"
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#f59e0b",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      }
    });

    // Update markers array
    const newMarkers = [...stopoverMarkers];
    newMarkers[index] = marker;
    setStopoverMarkers(newMarkers);
  };

  // Update route on map with advanced features
  const updateRoute = (mapInstance: any) => {
    if (!mapInstance || !window.google) return;
    
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
        draggable: true, // Enable waypoint dragging
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      // Add drag end listener for waypoint reordering
      renderer.addListener('directions_changed', () => {
        const directions = renderer.getDirections();
        if (directions) {
          updateRouteInfo(directions);
          // Handle waypoint reordering if needed
          handleWaypointReorder(directions);
        }
      });
      
      renderer.setMap(mapInstance);
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

    // Add legacy stopover if exists (for backwards compatibility)
    if (formData.stopover && showStopover && !formData.stopovers.length) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: formData.stopover }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const legacyWaypoints = [{
            location: results[0].geometry.location,
            stopover: true
          }];
          calculateRouteWithTraffic(directionsService, renderer, legacyWaypoints);
        } else {
          calculateRouteWithTraffic(directionsService, renderer, []);
        }
      });
      return;
    }

    // Calculate route with current waypoints
    calculateRouteWithTraffic(directionsService, renderer, waypoints);
  };

  // Enhanced route calculation with traffic awareness
  const calculateRouteWithTraffic = (directionsService: any, renderer: any, waypoints: any[]) => {
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
        updateRouteInfo(result);
        
        // Update pricing based on new route
        setTimeout(() => {
          calculatePrice();
        }, 500);
      } else {
        console.warn('Directions request failed due to ' + status);
        // Fallback to basic route without traffic
        calculateBasicRoute(directionsService, renderer, waypoints);
      }
    });
  };

  // Fallback basic route calculation
  const calculateBasicRoute = (directionsService: any, renderer: any, waypoints: any[]) => {
    const request = {
      origin: { lat: formData.pickupLat!, lng: formData.pickupLng! },
      destination: { lat: formData.destinationLat!, lng: formData.destinationLng! },
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        renderer.setDirections(result);
        updateRouteInfo(result);
      } else {
        console.warn('Basic directions request also failed due to ' + status);
      }
    });
  };

  // Update route information (distance, duration, ETA)
  const updateRouteInfo = (directionsResult: any) => {
    if (!directionsResult || !directionsResult.routes || !directionsResult.routes[0]) return;
    
    const route = directionsResult.routes[0];
    const leg = route.legs[0];
    
    if (leg) {
      // Update form data with route information
      setFormData(prev => ({
        ...prev,
        estimatedDistance: route.legs.reduce((total: number, leg: any) => total + leg.distance.value, 0),
        estimatedDuration: route.legs.reduce((total: number, leg: any) => total + leg.duration.value, 0),
        estimatedDurationInTraffic: route.legs.reduce((total: number, leg: any) => 
          total + (leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value), 0
        )
      }));
    }
  };

  // Handle waypoint reordering from drag operations
  const handleWaypointReorder = (directionsResult: any) => {
    if (!directionsResult || !directionsResult.routes || !directionsResult.routes[0]) return;
    
    const route = directionsResult.routes[0];
    if (route.waypoint_order && route.waypoint_order.length > 0) {
      // Reorder stopovers based on optimized waypoint order
      const reorderedStopovers = route.waypoint_order.map((index: number) => formData.stopovers[index]);
      
      setFormData(prev => ({
        ...prev,
        stopovers: reorderedStopovers
      }));
    }
  };

  // Update map bounds to show both markers
  const updateMapBounds = (mapInstance: any, pickup: { lat: number; lng: number } | null, destination: { lat: number; lng: number } | null) => {
    if (!mapInstance) return;

    if (pickup && destination) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickup);
      bounds.extend(destination);
      mapInstance.fitBounds(bounds);
      
      // Add some padding
      mapInstance.panToBounds(bounds);
    } else if (pickup || destination) {
      const location = pickup || destination;
      mapInstance.setCenter(location);
      mapInstance.setZoom(15);
    }
  };

  // Handle guest booking (direct payment without account)
  const handleGuestBooking = async () => {
    // Validate guest information if required
    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      // Show guest info form
      setIsGuestBooking(true);
      setIsSubmitting(false);
      return;
    }

    // Validate basic booking form
    const errors = validateBookingForm(formData);
    if (errors.length > 0) {
      toast({
        title: "Formulier onvolledig",
        description: errors[0],
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Find the vehicle
      const selectedVehicleData = vehicles.find(
        (v) => (v.type || '').toLowerCase() === (formData.vehicleType || '').toLowerCase()
      );
      if (!selectedVehicleData) {
        toast({
          title: "Voertuig niet beschikbaar",
          description: "Het geselecteerde voertuigtype is momenteel niet beschikbaar.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // For guest bookings, we'll store the booking with guest information
      // and redirect to account creation after payment
      const scheduledTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      // Create a temporary booking record with guest info
      const guestBookingData = {
        vehicle_id: selectedVehicleData.id,
        pickup_address: formData.pickup,
        pickup_lat: formData.pickupLat,
        pickup_lng: formData.pickupLng,
        destination_address: formData.destination,
        destination_lat: formData.destinationLat,
        destination_lng: formData.destinationLng,
        scheduled_time: scheduledTime,
        payment_method: formData.paymentMethod,
        status: 'payment_pending',
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone,
      };

      // Store guest booking info in localStorage for post-payment processing
      localStorage.setItem('pendingGuestBooking', JSON.stringify(guestBookingData));

      // Simulate payment redirect (in real implementation, redirect to payment provider)
      toast({
        title: "Doorverwijzing naar betaling",
        description: "Je wordt doorverwezen naar de betaalpagina...",
      });

      // Simulate payment success and redirect to account creation
      setTimeout(() => {
        // In real implementation, this would happen after successful payment callback
        toast({
          title: "Betaling succesvol",
          description: "Maak nu een account aan om je boeking te voltooien.",
        });

        // Redirect to login/signup page with a flag for post-payment
        window.location.href = '/login?postPayment=true&guestBooking=true';
      }, 2000);

    } catch (error) {
      console.error('Error creating guest booking:', error);
      toast({
        title: "Boeking mislukt",
        description: "Er is een fout opgetreden bij het verwerken van je boeking. Probeer het opnieuw.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Load available vehicles from database (for booking submission)
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        const { data, error } = await (supabase as any)
          .from('vehicles')
          .select('id, type, name')
          .eq('available', true);

        if (error) {
          console.error('Error loading vehicles:', error);
          // Don't show toast for vehicle loading errors since UI now uses standard vehicles
          setVehicles([]);
          return;
        }

        setVehicles(data || []);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, []);

  // Computed values to prevent unnecessary re-calculations
  const isFormValid = useMemo(() => {
    return !!(
      formData.pickup &&
      formData.destination &&
      formData.date &&
      formData.time &&
      formData.vehicleType &&
      formData.paymentMethod
    );
  }, [formData.pickup, formData.destination, formData.date, formData.time, formData.vehicleType, formData.paymentMethod]);

  const hasRequiredAddresses = useMemo(() => {
    return !!(formData.pickup && formData.destination);
  }, [formData.pickup, formData.destination]);

  const shouldShowPricing = useMemo(() => {
    return hasRequiredAddresses && !isCalculatingPrice && !priceError;
  }, [hasRequiredAddresses, isCalculatingPrice, priceError]);

  const updateFormData = useCallback((field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: sanitizeInput(value),
    }));
    
    // Trigger price calculation if relevant fields change
    if (['pickup', 'destination', 'vehicleType', 'date', 'time'].includes(field)) {
      // Debounce price calculation
      const timeoutId = setTimeout(() => {
        calculatePrice();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Auto-fill functions
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Locatie niet beschikbaar",
        description: "Uw browser ondersteunt geen geolocatie.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Locatie ophalen...",
      description: "Een moment geduld terwijl we uw locatie bepalen.",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use Google Maps Geocoding API to get address
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results: any, status: any) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                updateFormData('pickup', address);
                setFormData(prev => ({
                  ...prev,
                  pickup: address,
                  pickupLat: latitude,
                  pickupLng: longitude,
                }));

                // Update pickup marker
                if (map) {
                  if (pickupMarker) {
                    pickupMarker.setMap(null);
                  }
                  const newPickupMarker = new window.google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map: map,
                    title: "Huidige locatie",
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: "#10b981",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                    }
                  });
                  setPickupMarker(newPickupMarker);
                  
                  // Center map on current location
                  map.setCenter({ lat: latitude, lng: longitude });
                  map.setZoom(15);
                  
                  // Update route
                  updateRoute(map);
                }

                toast({
                  title: "Locatie ingesteld",
                  description: "Uw huidige locatie is ingesteld als ophaallocatie.",
                });
              } else {
                throw new Error('Geocoding failed');
              }
            });
          } else {
            throw new Error('Google Maps not available');
          }
        } catch (error) {
          console.error('Error getting address:', error);
          toast({
            title: "Adres niet gevonden",
            description: "Kon geen adres vinden voor uw locatie. Voer handmatig een adres in.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        let message = "Kon uw locatie niet bepalen.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Locatietoegang geweigerd. Geef toestemming in uw browserinstellingen.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Locatie-informatie is niet beschikbaar.";
            break;
          case error.TIMEOUT:
            message = "Locatieverzoek is verlopen. Probeer het opnieuw.";
            break;
        }
        toast({
          title: "Locatie fout",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };



  // Handle preset location selection
  const handlePresetLocation = (location: typeof PRESET_LOCATIONS[0], field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickup: location.address,
        pickupLat: location.coordinates.lat,
        pickupLng: location.coordinates.lng,
      }));
      setShowPickupSuggestions(false);
      
      // Update pickup marker if map exists
      if (map) {
        if (pickupMarker) {
          pickupMarker.setMap(null);
        }
        const newPickupMarker = new window.google.maps.Marker({
          position: location.coordinates,
          map: map,
          title: "Ophaallocatie",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }
        });
        setPickupMarker(newPickupMarker);
        updateMapBounds(map, location.coordinates, formData.destinationLat && formData.destinationLng ? { lat: formData.destinationLat, lng: formData.destinationLng } : null);
        updateRoute(map);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        destination: location.address,
        destinationLat: location.coordinates.lat,
        destinationLng: location.coordinates.lng,
      }));
      setShowDestinationSuggestions(false);
      
      // Update destination marker if map exists
      if (map) {
        if (destinationMarker) {
          destinationMarker.setMap(null);
        }
        const newDestinationMarker = new window.google.maps.Marker({
          position: location.coordinates,
          map: map,
          title: "Bestemmingslocatie",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }
        });
        setDestinationMarker(newDestinationMarker);
        updateMapBounds(map, formData.pickupLat && formData.pickupLng ? { lat: formData.pickupLat, lng: formData.pickupLng } : null, location.coordinates);
        updateRoute(map);
      }
    }
  };

  // Search Google Places with custom UI (debounced)
  const searchGooglePlaces = (query: string, field: 'pickup' | 'destination') => {
    // Clear existing timeout
    const timeoutRef = field === 'pickup' ? pickupSearchTimeoutRef : destinationSearchTimeoutRef;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!window.google || !query.trim() || query.length < 3) {
      if (field === 'pickup') {
        setGooglePlacesPickupResults([]);
      } else {
        setGooglePlacesDestinationResults([]);
      }
      return;
    }

    // Debounce the search to allow for proper typing including spaces
    timeoutRef.current = setTimeout(() => {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: query.trim(), // Trim spaces for search but preserve them in input
        componentRestrictions: { country: "be" },
        types: ['establishment', 'geocode']
      }, (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          if (field === 'pickup') {
            setGooglePlacesPickupResults(predictions.slice(0, 5)); // Limit to 5 results
          } else {
            setGooglePlacesDestinationResults(predictions.slice(0, 5));
          }
        } else {
          if (field === 'pickup') {
            setGooglePlacesPickupResults([]);
          } else {
            setGooglePlacesDestinationResults([]);
          }
        }
      });
    }, 300); // 300ms debounce delay
  };

  // Handle Google Places selection
  const handleGooglePlaceSelection = (placeId: string, description: string, field: 'pickup' | 'destination') => {
    if (!window.google) return;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'name']
    }, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        const validCoords = validateCoordinates(lat, lng);
        if (!validCoords) {
          console.warn('Invalid coordinates received from Google Maps');
          return;
        }

        if (field === 'pickup') {
          setFormData(prev => ({
            ...prev,
            pickup: place.formatted_address || place.name || description,
            pickupLat: validCoords.lat,
            pickupLng: validCoords.lng,
          }));
          setShowPickupSuggestions(false);
          setGooglePlacesPickupResults([]);
          
          // Update pickup marker
          if (map) {
            if (pickupMarker) {
              pickupMarker.setMap(null);
            }
            const newPickupMarker = new window.google.maps.Marker({
              position: { lat: validCoords.lat, lng: validCoords.lng },
              map: map,
              title: "Ophaallocatie",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#10b981",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }
            });
            setPickupMarker(newPickupMarker);
            updateMapBounds(map, { lat: validCoords.lat, lng: validCoords.lng }, formData.destinationLat && formData.destinationLng ? { lat: formData.destinationLat, lng: formData.destinationLng } : null);
            updateRoute(map);
          }
        } else {
          setFormData(prev => ({
            ...prev,
            destination: place.formatted_address || place.name || description,
            destinationLat: validCoords.lat,
            destinationLng: validCoords.lng,
          }));
          setShowDestinationSuggestions(false);
          setGooglePlacesDestinationResults([]);
          
          // Update destination marker
          if (map) {
            if (destinationMarker) {
              destinationMarker.setMap(null);
            }
            const newDestinationMarker = new window.google.maps.Marker({
              position: { lat: validCoords.lat, lng: validCoords.lng },
              map: map,
              title: "Bestemmingslocatie",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }
            });
            setDestinationMarker(newDestinationMarker);
            updateMapBounds(map, formData.pickupLat && formData.pickupLng ? { lat: formData.pickupLat, lng: formData.pickupLng } : null, { lat: validCoords.lat, lng: validCoords.lng });
            updateRoute(map);
          }
        }
      }
    });
  };

  // Calculate price based on current form data
  const calculatePrice = async () => {
    // Only calculate if we have pickup and destination
    if (!formData.pickup || !formData.destination) {
      setPriceBreakdown(null);
      return;
    }

    setIsCalculatingPrice(true);
    setPriceError(null);

    try {
      // Prepare waypoints for distance calculation
      const waypoints: string[] = [];
      
      // Add stopovers
      formData.stopovers.forEach(stopover => {
        if (stopover.address) {
          waypoints.push(stopover.address);
        }
      });
      
      // Add legacy stopover for backwards compatibility
      if (formData.stopover && !waypoints.length) {
        waypoints.push(formData.stopover);
      }

      // Calculate distance
      const distance = await DistanceService.calculateDistance(
        formData.pickup,
        formData.destination,
        waypoints.length > 0 ? waypoints : undefined
      );

      setDistanceResult(distance);

      // Parse pickup date/time
      const pickupTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`)
        : new Date();

      // Calculate price
      const breakdown = PricingService.calculatePriceFromDistance(
        formData.vehicleType,
        distance,
        pickupTime,
        formData.pickup,
        waypoints.length > 0
      );

      setPriceBreakdown(breakdown);

      // Only show warnings for extreme prices (over €500)
      const validation = PricingService.validatePrice(breakdown);
      if (validation.warnings.length > 0 && breakdown.total > 500) {
        toast({
          title: "Prijscontrole",
          description: validation.warnings[0],
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Price calculation failed:', error);
      setPriceError(error instanceof Error ? error.message : 'Prijsberekening mislukt');
      
      // Fallback to estimate
      try {
        const estimateBreakdown = PricingService.getEstimatePrice(
          formData.vehicleType,
          10, // 10km estimate
          formData.date && formData.time ? new Date(`${formData.date}T${formData.time}:00`) : new Date()
        );
        setPriceBreakdown(estimateBreakdown);
      } catch (estimateError) {
        console.error('Estimate calculation also failed:', estimateError);
      }
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Trigger price calculation when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculatePrice();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.pickup, formData.destination, formData.vehicleType, formData.date, formData.time, formData.stopover]);

  // Update route when locations change
  useEffect(() => {
    if (map && googleMapsLoaded) {
      const timeoutId = setTimeout(() => {
        updateRoute(map);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.pickupLat, formData.pickupLng, formData.destinationLat, formData.destinationLng, formData.stopover, formData.stopovers, showStopover, map, googleMapsLoaded]);

  // Setup autocomplete for new stopovers
  useEffect(() => {
    if (map && googleMapsLoaded && window.google) {
      // Setup autocomplete for any new stopovers
      formData.stopovers.forEach((stopover, index) => {
        const inputRef = stopoverRefs.current[index];
        if (inputRef && inputRef.current && !inputRef.current.getAttribute('data-autocomplete-setup')) {
          const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              componentRestrictions: { country: "be" },
              fields: ["formatted_address", "geometry", "name"]
            }
          );

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              const validCoords = validateCoordinates(lat, lng);
              if (!validCoords) {
                console.warn('Invalid coordinates received from Google Maps');
                return;
              }
              
              updateStopover(stopover.id, {
                address: place.formatted_address || place.name || "",
                coordinates: validCoords
              });

              updateStopoverMarker(index, validCoords, map);
              updateRoute(map);
            }
          });

          // Mark as setup to prevent duplicate autocompletes
          inputRef.current.setAttribute('data-autocomplete-setup', 'true');
        }
      });
    }
  }, [formData.stopovers.length, map, googleMapsLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if user is logged in - only invoice payment requires login
    if (!user && formData.paymentMethod === 'invoice') {
      toast({
        title: "Inloggen vereist",
        description: "Log in om een factuur te kunnen aanvragen.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Handle guest booking (all payment methods except invoice)
    if (!user && formData.paymentMethod !== 'invoice') {
      return handleGuestBooking();
    }

    const errors = validateBookingForm(formData);
    
    if (errors.length > 0) {
      toast({
        title: "Formulier onvolledig",
        description: errors[0],
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Find the vehicle ID based on selected vehicle type (case-insensitive)
      const selectedVehicleData = vehicles.find(
        (v) => (v.type || '').toLowerCase() === (formData.vehicleType || '').toLowerCase()
      );
      if (!selectedVehicleData) {
        toast({
          title: "Voertuig niet beschikbaar",
          description: "Het geselecteerde voertuigtype is momenteel niet beschikbaar.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Combine date and time into ISO string
      const scheduledTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      // Prepare booking data
      const bookingData = {
        user_id: user.id,
        vehicle_id: selectedVehicleData.id,
        pickup_address: formData.pickup,
        pickup_lat: formData.pickupLat,
        pickup_lng: formData.pickupLng,
        destination_address: formData.destination,
        destination_lat: formData.destinationLat,
        destination_lng: formData.destinationLng,
        scheduled_time: scheduledTime,
        payment_method: formData.paymentMethod,
        status: 'pending'
      };

      // Insert booking into database and return the created row
      const { data: insertedBooking, error: insertError } = await typedSupabase.bookings
        .insert([bookingData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Best-effort: mark assigned vehicle as unavailable so it won't be double-booked
      try {
        const { error: updateVehicleError } = await typedSupabase.vehicles
          .update(selectedVehicleData.id, { available: false, updated_at: new Date().toISOString() });

        if (updateVehicleError) {
          console.warn('Failed to update vehicle availability:', updateVehicleError);
        }
      } catch (err) {
        console.warn('Failed to update vehicle availability:', err);
      }

      toast({
        title: "Rit geboekt!",
        description: `Uw rit van ${formData.pickup} naar ${formData.destination} is succesvol geboekt.`,
      });

      // Call success callback if provided
      onBookingSuccess?.();

      // Reset form
      setFormData({
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
      
      // Clear markers and route
      if (pickupMarker) {
        pickupMarker.setMap(null);
        setPickupMarker(null);
      }
      if (destinationMarker) {
        destinationMarker.setMap(null);
        setDestinationMarker(null);
      }
      if (stopoverMarker) {
        stopoverMarker.setMap(null);
        setStopoverMarker(null);
      }
      // Clear all stopover markers
      stopoverMarkers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      setStopoverMarkers([]);
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        setDirectionsRenderer(null);
      }

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Boeking mislukt",
        description: "Er is een fout opgetreden bij het boeken van je rit. Probeer het opnieuw.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // Update step errors when validation changes
  useEffect(() => {
    const errors1: string[] = [];
    if (!formData.pickup?.trim()) errors1.push("Ophaaladres is verplicht");
    if (!formData.destination?.trim()) errors1.push("Bestemmingsadres is verplicht");
    if (!formData.date) errors1.push("Datum is verplicht");
    if (!formData.time) errors1.push("Tijd is verplicht");
    
    const errors2: string[] = [];
    if (!formData.vehicleType) errors2.push("Voertuigtype is verplicht");
    if (!formData.paymentMethod) errors2.push("Betaalmethode is verplicht");
    
    const errors3: string[] = [];
    if (!user && formData.paymentMethod !== 'invoice') {
      if (!formData.guestName?.trim()) errors3.push("Naam is verplicht");
      if (!formData.guestEmail?.trim()) errors3.push("E-mailadres is verplicht");
      if (!formData.guestPhone?.trim()) errors3.push("Telefoonnummer is verplicht");
    }
    
    setStepErrors({
      1: errors1,
      2: errors2,
      3: errors3
    });
  }, [formData, user]);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <BookingWizard
      currentStep={currentStep}
      totalSteps={3}
      onStepChange={setCurrentStep}
      canAdvanceToStep2={() => validateStep1(formData)}
      canAdvanceToStep3={() => validateStep2(formData)}
      steps={[
        { title: "Route & Tijd", description: "Waar wil je naartoe en wanneer?" },
        { title: "Voertuig", description: "Kies je gewenste voertuig" },
        { title: "Betaling", description: "Bevestig je boeking" }
      ]}
    >
      <Card className="w-full max-w-2xl mx-auto border-0 shadow-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-semibold">Boek je rit</CardTitle>
        </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Route & Time */}
          {currentStep === 1 && (
            <>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
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
                Huidige locatie
              </Button>
            </div>
            <div className="relative">
              <Input
                ref={pickupInputRef}
                placeholder="Address, airport, hotel, ..."
                value={formData.pickup}
                onChange={(e) => {
                  updateFormData('pickup', e.target.value);
                  const value = e.target.value;
                  if (value.length === 0) {
                    setShowPickupSuggestions(true);
                    setGooglePlacesPickupResults([]);
                  } else if (value.length >= 3) {
                    setShowPickupSuggestions(true);
                    searchGooglePlaces(value, 'pickup');
                  } else {
                    setShowPickupSuggestions(false);
                    setGooglePlacesPickupResults([]);
                  }
                }}
                onFocus={() => {
                  if (formData.pickup.length === 0) {
                    setShowPickupSuggestions(true);
                  } else if (formData.pickup.length >= 3) {
                    setShowPickupSuggestions(true);
                    searchGooglePlaces(formData.pickup, 'pickup');
                  }
                }}
                onBlur={() => setTimeout(() => {
                  setShowPickupSuggestions(false);
                  setGooglePlacesPickupResults([]);
                }, 200)}
                className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
              
              {/* Pickup Suggestions */}
              {showPickupSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border max-h-80 overflow-y-auto">
                  <CardContent className="p-2">
                    {/* Current Location */}
                    {formData.pickup.length === 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-3 mb-2 hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCurrentLocation();
                          setShowPickupSuggestions(false);
                          setGooglePlacesPickupResults([]);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Huidige locatie</div>
                            <div className="text-xs text-muted-foreground">Gebruik GPS voor uw locatie</div>
                          </div>
                        </div>
                      </Button>
                    )}
                    
                    {/* Google Places Results */}
                    {googlePlacesPickupResults.length > 0 && (
                      <div className="border-t pt-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Zoekresultaten</div>
                        {googlePlacesPickupResults.map((result, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault();
                              handleGooglePlaceSelection(result.place_id, result.description, 'pickup');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{result.structured_formatting?.main_text || result.description}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.structured_formatting?.secondary_text || result.description}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Preset Locations */}
                    {formData.pickup.length === 0 && (
                      <div className="border-t pt-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Populaire locaties</div>
                        {PRESET_LOCATIONS.map((location, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePresetLocation(location, 'pickup');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-lg">{location.icon}</div>
                              <div>
                                <div className="font-medium text-sm">{location.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{location.address}</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* To Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>To</span>
            </div>
            <div className="relative">
              <Input
                ref={destinationInputRef}
                placeholder="Address, airport, hotel, ..."
                value={formData.destination}
                onChange={(e) => {
                  updateFormData('destination', e.target.value);
                  const value = e.target.value;
                  if (value.length === 0) {
                    setShowDestinationSuggestions(true);
                    setGooglePlacesDestinationResults([]);
                  } else if (value.length >= 3) {
                    setShowDestinationSuggestions(true);
                    searchGooglePlaces(value, 'destination');
                  } else {
                    setShowDestinationSuggestions(false);
                    setGooglePlacesDestinationResults([]);
                  }
                }}
                onFocus={() => {
                  if (formData.destination.length === 0) {
                    setShowDestinationSuggestions(true);
                  } else if (formData.destination.length >= 3) {
                    setShowDestinationSuggestions(true);
                    searchGooglePlaces(formData.destination, 'destination');
                  }
                }}
                onBlur={() => setTimeout(() => {
                  setShowDestinationSuggestions(false);
                  setGooglePlacesDestinationResults([]);
                }, 200)}
                className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
              
              {/* Destination Suggestions */}
              {showDestinationSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border max-h-80 overflow-y-auto">
                  <CardContent className="p-2">
                    {/* Google Places Results */}
                    {googlePlacesDestinationResults.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Zoekresultaten</div>
                        {googlePlacesDestinationResults.map((result, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault();
                              handleGooglePlaceSelection(result.place_id, result.description, 'destination');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{result.structured_formatting?.main_text || result.description}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.structured_formatting?.secondary_text || result.description}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Preset Locations */}
                    {formData.destination.length === 0 && (
                      <div className={googlePlacesDestinationResults.length > 0 ? "border-t pt-2" : ""}>
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Populaire bestemmingen</div>
                        {PRESET_LOCATIONS.map((location, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePresetLocation(location, 'destination');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-lg">{location.icon}</div>
                              <div>
                                <div className="font-medium text-sm">{location.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{location.address}</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>



          {/* Date and Time Selector */}
          <DateTimeSelector
            selectedDate={formData.date ? new Date(formData.date) : null}
            selectedTime={formData.time}
            onDateChange={(date) => updateFormData('date', date ? date.toISOString().split('T')[0] : '')}
            onTimeChange={(time) => updateFormData('time', time)}
            minDate={new Date()}
            showQuickActions={true}
            timeStep={15}
            className="md:max-w-md"
          />
            </>
          )}

          {/* Step 2: Vehicle & Payment */}
          {currentStep >= 2 && (
            <>
              {/* Vehicle Selection */}
              <VehicleSelector
                selectedVehicle={formData.vehicleType}
                onVehicleSelect={(value) => updateFormData('vehicleType', value)}
                showPricing={true}
                bookingType="regular"
              />

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData('paymentMethod', value)}>
                  <SelectTrigger className="border-0 border-b border-border rounded-none px-0 focus:ring-0">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.filter(method => user || method.value !== 'credit').map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Price Display */}
              <div 
                role="region" 
                aria-label="Prijsinformatie"
                aria-live="polite"
                aria-atomic="true"
              >
                <EnhancedPriceDisplay
                  priceBreakdown={priceBreakdown}
                  loading={isCalculatingPrice}
                  error={priceError}
                  estimatedDistance={formData.estimatedDistance}
                  estimatedDuration={formData.estimatedDuration}
                  estimatedDurationInTraffic={formData.estimatedDurationInTraffic}
                  scheduledTime={formData.time}
                  showTrafficImpact={true}
                  showTimeBasedPricing={true}
                  className="my-4"
                />
              </div>
            </>
          )}

          {/* Step 3: Final Details & Booking */}
          {currentStep >= 3 && (
            <>
              {/* Guest Information - show when not logged in and not using invoice */}
              {!user && formData.paymentMethod !== 'invoice' && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info className="w-4 h-4" />
                    <span>Contactgegevens voor gastboeking</span>
                  </div>
                  
                  <div className="space-y-3">
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
                        required
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
                        required
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

                  <div className="text-xs text-muted-foreground">
                    <Info className="w-3 h-3 inline mr-1" />
                    Na de betaling wordt u doorverwezen om een account aan te maken voor uw boeking.
                  </div>
                </div>
              )}

              {/* Map Container */}
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Map className="w-4 h-4" />
                  <span>Route kaart</span>
                </div>
                <div className="space-y-2">
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
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || isCalculatingPrice}
                >
                  {isSubmitting 
                    ? (!user && formData.paymentMethod !== 'invoice' ? "Processing payment..." : "Booking...") 
                    : isCalculatingPrice
                    ? "Calculating price..."
                    : priceBreakdown 
                    ? (!user && formData.paymentMethod !== 'invoice' 
                       ? `Pay ${priceBreakdown.total.toLocaleString('nl-NL', {style: 'currency', currency: 'EUR'})} & Book` 
                       : `Book Ride - ${priceBreakdown.total.toLocaleString('nl-NL', {style: 'currency', currency: 'EUR'})}`)
                    : (!user && formData.paymentMethod !== 'invoice' ? "Pay & Book Ride" : "Book Ride")
                  }
                </Button>
                {showCancelButton && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={onBookingCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  </BookingWizard>
  );
});