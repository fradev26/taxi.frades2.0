import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Clock, Info, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { validateBookingForm, sanitizeInput } from "@/utils/validation";
import { PAYMENT_METHODS } from "@/constants";
import type { BookingFormData } from "@/types";

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

export function BookingForm({ onBookingSuccess, onBookingCancel, showCancelButton = false }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: "",
    destination: "",
    stopover: "",
    date: "",
    time: "",
    paymentMethod: "",
    vehicleType: "standard",
    pickupLat: undefined,
    pickupLng: undefined,
    destinationLat: undefined,
    destinationLng: undefined,
  });
  const [selectedTab, setSelectedTab] = useState("oneway");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [pickupMarker, setPickupMarker] = useState<any>(null);
  const [destinationMarker, setDestinationMarker] = useState<any>(null);
  
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = () => {
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
            
            setFormData(prev => ({
              ...prev,
              pickup: place.formatted_address || place.name || "",
              pickupLat: lat,
              pickupLng: lng,
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
            
            // Update map bounds if both locations are set
            updateMapBounds(mapInstance, { lat, lng }, formData.destinationLat && formData.destinationLng ? { lat: formData.destinationLat, lng: formData.destinationLng } : null);
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
            
            setFormData(prev => ({
              ...prev,
              destination: place.formatted_address || place.name || "",
              destinationLat: lat,
              destinationLng: lng,
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
            
            // Update map bounds if both locations are set
            updateMapBounds(mapInstance, formData.pickupLat && formData.pickupLng ? { lat: formData.pickupLat, lng: formData.pickupLng } : null, { lat, lng });
          }
        });
      }
    };

    // Wait for Google Maps to load
    if (window.google) {
      initializeGoogleMaps();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleMaps);
          initializeGoogleMaps();
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, [showMap]);

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

  // Load available vehicles from database
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, type, name')
          .eq('available', true);

        if (error) {
          console.error('Error loading vehicles:', error);
          return;
        }

        setVehicles(data || []);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    };

    loadVehicles();
  }, []);

  const updateFormData = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: sanitizeInput(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Inloggen vereist",
        description: "Je moet ingelogd zijn om een rit te boeken.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
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
      // Find the vehicle ID based on selected vehicle type
      const selectedVehicleData = vehicles.find(v => v.type === formData.vehicleType);
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

      // Insert booking into database
      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) {
        throw error;
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
        date: "",
        time: "",
        paymentMethod: "",
        vehicleType: "standard",
        pickupLat: undefined,
        pickupLng: undefined,
        destinationLat: undefined,
        destinationLng: undefined,
      });
      
      // Clear markers
      if (pickupMarker) {
        pickupMarker.setMap(null);
        setPickupMarker(null);
      }
      if (destinationMarker) {
        destinationMarker.setMap(null);
        setDestinationMarker(null);
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

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-2xl border-0">
      <CardContent className="p-6">
        {/* Service Type Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="oneway" className="text-sm">One way</TabsTrigger>
            <TabsTrigger value="hourly" className="text-sm">By the hour</TabsTrigger>
          </TabsList>

          <TabsContent value="oneway" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />
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
                  className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>

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

              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Vehicle Type</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => updateFormData('vehicleType', value)}>
                  <SelectTrigger className="border-0 border-b border-border rounded-none px-0 focus:ring-0">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.type}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {/* Map Toggle */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2"
                >
                  <Map className="w-4 h-4" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>

              {/* Map Container */}
              {showMap && (
                <div className="space-y-2">
                  <div 
                    ref={mapRef}
                    className="w-full h-64 rounded-lg border"
                    style={{ minHeight: '256px' }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Booking..." : "Book Ride"}
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
          </TabsContent>

          <TabsContent value="hourly" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Info className="w-8 h-8 mx-auto mb-2" />
              <p>Hourly booking feature coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}