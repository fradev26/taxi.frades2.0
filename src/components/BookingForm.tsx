import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Clock, Info, Map, Loader2, User, Mail, Phone, Plus, X } from "lucide-react";
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

// Helper function to validate coordinates
const validateCoordinates = (lat: any, lng: any): { lat: number; lng: number } | null => {
  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);
  
  if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
    return null;
  }
  
  return { lat: numLat, lng: numLng };
};

export function BookingForm({ onBookingSuccess, onBookingCancel, showCancelButton = false }: BookingFormProps) {
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
  
  // Pricing state
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const stopoverInputRef = useRef<HTMLInputElement>(null);
  const stopoverRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Stopover management functions
  const addStopover = () => {
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
  };

  const removeStopover = (id: string) => {
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
  };

  const updateStopover = (id: string, updates: Partial<Stopover>) => {
    setFormData(prev => ({
      ...prev,
      stopovers: prev.stopovers.map(stopover => 
        stopover.id === id ? { ...stopover, ...updates } : stopover
      )
    }));
  };

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

      // Initialize autocomplete for pickup
      if (pickupInputRef.current) {
        const pickupAutocomplete = new window.google.maps.places.Autocomplete(
          pickupInputRef.current,
          {
            componentRestrictions: { country: "be" },
            fields: ["formatted_address", "geometry", "name"]
          }
        );

        pickupAutocomplete.addListener("place_changed", () => {
          const place = pickupAutocomplete.getPlace();
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
          pickup: place.formatted_address || place.name || "",
          pickupLat: validCoords.lat,
          pickupLng: validCoords.lng,
            }));

            // Update pickup marker
            if (pickupMarker) {
          pickupMarker.setMap(null);
            }
            const newPickupMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
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
            
            // Update map bounds and route
            updateMapBounds(mapInstance, { lat, lng }, formData.destinationLat && formData.destinationLng ? { lat: formData.destinationLat, lng: formData.destinationLng } : null);
            updateRoute(mapInstance);
          }
        });
      }

      // Initialize autocomplete for destination
      if (destinationInputRef.current) {
        const destinationAutocomplete = new window.google.maps.places.Autocomplete(
          destinationInputRef.current,
          {
            componentRestrictions: { country: "be" },
            fields: ["formatted_address", "geometry", "name"]
          }
        );

        destinationAutocomplete.addListener("place_changed", () => {
          const place = destinationAutocomplete.getPlace();
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
          destination: place.formatted_address || place.name || "",
          destinationLat: validCoords.lat,
          destinationLng: validCoords.lng,
            }));

            // Update destination marker
            if (destinationMarker) {
          destinationMarker.setMap(null);
            }
            const newDestinationMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          title: "Bestemming",
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
            
            // Update map bounds and route
            updateMapBounds(mapInstance, formData.pickupLat && formData.pickupLng ? { lat: formData.pickupLat, lng: formData.pickupLng } : null, { lat, lng });
            updateRoute(mapInstance);
          }
        });
      }

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
      // Find the vehicle (use same logic as authenticated booking)
      let selectedVehicleData = vehicles.find(
        (v) => (v.type || '').toLowerCase() === (formData.vehicleType || '').toLowerCase()
      );
      
      // If no exact match, try to find a compatible vehicle
      if (!selectedVehicleData && vehicles.length > 0) {
        const vehicleTypeMapping: { [key: string]: string[] } = {
          'standard': ['sedan', 'eco', 'standard'],
          'luxury': ['luxury', 'premium'],
          'van': ['van', 'suv', 'minivan']
        };
        
        const compatibleTypes = vehicleTypeMapping[formData.vehicleType.toLowerCase()] || [];
        selectedVehicleData = vehicles.find(
          (v) => compatibleTypes.includes((v.type || '').toLowerCase())
        );
      }
      
      // If still no match, use any available vehicle as fallback
      if (!selectedVehicleData && vehicles.length > 0) {
        selectedVehicleData = vehicles[0];
        console.warn(`No exact vehicle match for ${formData.vehicleType}, using fallback for guest booking`);
      }

      // For guest bookings, we'll store the booking with guest information
      // and redirect to account creation after payment
      const scheduledTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      // Create a temporary booking record with guest info
      const guestBookingData = {
        vehicle_id: selectedVehicleData?.id || null,
        vehicle_type: formData.vehicleType,
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

  const updateFormData = (field: keyof BookingFormData, value: string) => {
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

      // Show warning if price seems high
      const validation = PricingService.validatePrice(breakdown);
      if (validation.warnings.length > 0) {
        toast({
          title: "Prijsmelding",
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
    
    // Check if user is logged in or if it's direct payment (guest booking)
    if (!user && formData.paymentMethod !== 'direct') {
      toast({
        title: "Inloggen vereist",
        description: "Je moet ingelogd zijn om een rit te boeken, of kies voor Direct Payment.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Handle guest booking for direct payment
    if (!user && formData.paymentMethod === 'direct') {
      return handleGuestBooking();
    }
    
    // Ensure user exists in users table (should be created by trigger, but check anyway)
    if (user) {
      try {
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (userCheckError && userCheckError.code === 'PGRST116') {
          // User doesn't exist in users table, create them
          console.log('User not found in users table, creating...');
          const { error: createUserError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || ''
            });
          
          if (createUserError) {
            console.error('Failed to create user in users table:', createUserError);
            // Continue anyway, the booking might work without it
          }
        }
      } catch (err) {
        console.warn('Error checking user existence:', err);
        // Continue anyway
      }
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
      // First try exact match, then fallback to any available vehicle
      let selectedVehicleData = vehicles.find(
        (v) => (v.type || '').toLowerCase() === (formData.vehicleType || '').toLowerCase()
      );
      
      // If no exact match, try to find a compatible vehicle
      if (!selectedVehicleData && vehicles.length > 0) {
        // Try to find a vehicle based on category mapping
        const vehicleTypeMapping: { [key: string]: string[] } = {
          'standard': ['sedan', 'eco', 'standard'],
          'luxury': ['luxury', 'premium'],
          'van': ['van', 'suv', 'minivan']
        };
        
        const compatibleTypes = vehicleTypeMapping[formData.vehicleType.toLowerCase()] || [];
        selectedVehicleData = vehicles.find(
          (v) => compatibleTypes.includes((v.type || '').toLowerCase())
        );
      }
      
      // If still no match, use any available vehicle as fallback
      if (!selectedVehicleData && vehicles.length > 0) {
        selectedVehicleData = vehicles[0];
        console.warn(`No exact vehicle match for ${formData.vehicleType}, using fallback vehicle:`, selectedVehicleData);
      }

      // Combine date and time into ISO string
      const scheduledTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      // Prepare booking data - vehicle_id is optional, vehicle_type stores user's selection
      const bookingData = {
        user_id: user.id,
        vehicle_id: selectedVehicleData?.id || null,
        vehicle_type: formData.vehicleType,
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
      console.log('Attempting to insert booking:', bookingData);
      const { data: insertedBooking, error: insertError } = await typedSupabase.bookings
        .insert([bookingData])
        .select()
        .single();

      if (insertError) {
        console.error('Booking insert error:', insertError);
        throw insertError;
      }
      
      console.log('Booking created successfully:', insertedBooking);

      // Best-effort: mark assigned vehicle as unavailable so it won't be double-booked
      // Only attempt this if we have a valid vehicle_id
      if (selectedVehicleData?.id) {
        try {
          const { error: updateVehicleError } = await typedSupabase.vehicles
            .update(selectedVehicleData.id, { available: false, updated_at: new Date().toISOString() });

          if (updateVehicleError) {
            console.warn('Failed to update vehicle availability:', updateVehicleError);
          }
        } catch (err) {
          console.warn('Failed to update vehicle availability:', err);
        }
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

    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "Er is een fout opgetreden bij het boeken van je rit. Probeer het opnieuw.";
      
      if (error?.message) {
        // Check for specific error types
        if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = "Je hebt geen toestemming om een boeking te maken. Zorg dat je bent ingelogd.";
        } else if (error.message.includes('duplicate')) {
          errorMessage = "Deze boeking bestaat al. Controleer je huidige boekingen.";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Er ontbreekt referentiedata. Neem contact op met support.";
        } else {
          errorMessage = `Fout: ${error.message}`;
        }
      }
      
      toast({
        title: "Boeking mislukt",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      role="form"
      aria-label="Taxi booking form"
    >
          {/* From Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-accent-green rounded-full"></div>
          <span>From</span>
            </div>
            <Input
          ref={pickupInputRef}
          placeholder="Address, airport, hotel, ..."
          value={formData.pickup}
          onChange={(e) => updateFormData('pickup', e.target.value)}
          onKeyDown={(e) => {
            // Ensure spaces work properly in input
            if (e.key === ' ') {
              e.stopPropagation();
            }
          }}
          className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>

          {/* Multiple Stopovers Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Tussenstops</span>
              </div>
              <AddStopoverButton
                onClick={addStopover}
                disabled={isSubmitting}
                loading={false}
                maxReached={formData.stopovers.length >= 5}
              />
            </div>
            
            {/* Render existing stopovers */}
            {formData.stopovers.map((stopover, index) => {
              // Ensure we have a ref for this stopover
              if (!stopoverRefs.current[index]) {
                stopoverRefs.current[index] = React.createRef<HTMLInputElement>();
              }
              
              return (
                <div key={stopover.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <span className="flex-shrink-0">{index + 1}</span>
                  </div>
                  <Input
                    ref={stopoverRefs.current[index]}
                    placeholder={`Tussenstop ${index + 1}`}
                    value={stopover.address}
                    onChange={(e) => updateStopover(stopover.id, { address: e.target.value })}
                    onKeyDown={(e) => {
                      // Ensure spaces work properly in input
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStopover(stopover.id)}
                    className="text-xs h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}

            {/* Legacy stopover for backwards compatibility */}
            {showStopover && formData.stopovers.length === 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                  <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                  <span className="flex-shrink-0">1</span>
                </div>
                <Input
                  ref={stopoverInputRef}
                  placeholder="Tussenstop"
                  value={formData.stopover}
                  onChange={(e) => updateFormData('stopover', e.target.value)}
                  onKeyDown={(e) => {
                    // Ensure spaces work properly in input
                    if (e.key === ' ') {
                      e.stopPropagation();
                    }
                  }}
                  className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowStopover(false);
                    setFormData(prev => ({ ...prev, stopover: "" }));
                    if (stopoverMarker) {
                      stopoverMarker.setMap(null);
                      setStopoverMarker(null);
                    }
                    if (map) updateRoute(map);
                  }}
                  className="text-xs h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* To Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>To</span>
            </div>
            <Input
          ref={destinationInputRef}
          placeholder="Address, airport, hotel, ..."
          value={formData.destination}
          onChange={(e) => updateFormData('destination', e.target.value)}
          onKeyDown={(e) => {
            // Ensure spaces work properly in input
            if (e.key === ' ') {
              e.stopPropagation();
            }
          }}
          className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>



          {/* Date & Time Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                min={today}
                className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>

            {/* Time Field */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => updateFormData('time', e.target.value)}
                className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
          </div>

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
                {PAYMENT_METHODS.map((method) => (
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

          {/* Guest Information - only show for direct payment when not logged in */}
          {!user && formData.paymentMethod === 'direct' && (
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
                    onKeyDown={(e) => {
                      // Ensure spaces work properly in input
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
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
                    onKeyDown={(e) => {
                      // Ensure spaces work properly in input
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone" className="text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefoonnummer
                  </Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    placeholder="+32 123 456 789"
                    value={formData.guestPhone || ""}
                    onChange={(e) => updateFormData('guestPhone', e.target.value)}
                    onKeyDown={(e) => {
                      // Ensure spaces work properly in input
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    required
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
                ? (!user && formData.paymentMethod === 'direct' ? "Processing payment..." : "Booking...") 
                : isCalculatingPrice
                ? "Calculating price..."
                : priceBreakdown 
                ? (!user && formData.paymentMethod === 'direct' 
                   ? `Pay ${priceBreakdown.total.toLocaleString('nl-NL', {style: 'currency', currency: 'EUR'})} & Book` 
                   : `Book Ride - ${priceBreakdown.total.toLocaleString('nl-NL', {style: 'currency', currency: 'EUR'})}`)
                : (!user && formData.paymentMethod === 'direct' ? "Pay & Book Ride" : "Book Ride")
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
    </form>
  );
}