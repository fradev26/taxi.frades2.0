import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DateTimeSelector } from "@/components/ui/datetime-selector";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Car, 
  Crown,
  Users,
  Euro,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { VehicleSelector } from "@/components/VehicleSelector";
import { STANDARD_VEHICLES } from "@/config/vehicles";
import { initializeGoogleMaps, waitForGoogleMapsAPI, isGoogleMapsAPILoaded } from "@/utils/googleMaps";
import { PAYMENT_METHODS } from "@/constants";
import { BookingWizard } from "@/components/ui/booking-wizard";

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

interface CompactHourlyBookingData {
  duration: number;
  startDate: Date | null;
  startTime: string;
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number };
  vehicleType: string;
  paymentMethod: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export const CompactHourlyBookingForm = React.memo(function CompactHourlyBookingForm() {
  const [bookingData, setBookingData] = useState<CompactHourlyBookingData>({
    duration: 2,
    startDate: null,
    startTime: "",
    pickupLocation: "",
    pickupCoordinates: undefined,
    vehicleType: "standard", // Fix: changed from "economy" to "standard"
    paymentMethod: "ideal",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Step management for wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset payment method if user logs out and credit was selected
  useEffect(() => {
    if (!user && bookingData.paymentMethod === 'credit') {
      setBookingData(prev => ({ ...prev, paymentMethod: 'direct' }));
    }
  }, [user, bookingData.paymentMethod]);
  const navigate = useNavigate();
  const pickupInputRef = useRef<HTMLInputElement>(null);

  const recentLocations = [
    "Brussels Airport (BRU)",
    "Brussels Central Station",
    "Grand Place, Brussels"
  ];

  // Calculate price
  const calculatePrice = () => {
    const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
    if (!selectedVehicle) return 0;
    
    const basePrice = selectedVehicle.basePrice;
    const hourlyPrice = selectedVehicle.hourlyRate * bookingData.duration;
    return basePrice + hourlyPrice;
  };

  // Handle current location
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
                setBookingData(prev => ({
                  ...prev,
                  pickupLocation: address,
                  pickupCoordinates: { lat: latitude, lng: longitude }
                }));
                setErrors(prev => ({ ...prev, pickupLocation: "" }));
                setShowLocationSuggestions(false);

                toast({
                  title: "Locatie gevonden",
                  description: "Uw huidige locatie is ingesteld als ophaallocatie.",
                });
              } else {
                throw new Error('Geocoding failed');
              }
            });
          } else {
            throw new Error('Google Maps not loaded');
          }
        } catch (error) {
          console.error('Error getting address:', error);
          toast({
            title: "Fout bij locatie bepaling",
            description: "Kon het adres niet bepalen. Probeer het opnieuw.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Kon uw locatie niet bepalen.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Toegang tot locatie geweigerd. Sta locatietoegang toe in uw browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Locatie is niet beschikbaar.";
            break;
          case error.TIMEOUT:
            errorMessage = "Locatie ophalen duurde te lang.";
            break;
        }

        toast({
          title: "Locatie fout",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Initialize Google Maps
  useEffect(() => {
    const setupGoogleMaps = async () => {
      try {
        if (!isGoogleMapsAPILoaded()) {
          await initializeGoogleMaps();
        }
        await waitForGoogleMapsAPI();
        setGoogleMapsLoaded(true);
        setupAutocomplete();
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    setupGoogleMaps();
  }, []);

  // Setup autocomplete for pickup location
  const setupAutocomplete = () => {
    if (!window.google || !pickupInputRef.current) return;

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
        setBookingData(prev => ({
          ...prev,
          pickupLocation: place.formatted_address || place.name || "",
          pickupCoordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
        setShowLocationSuggestions(false);
        setErrors(prev => ({ ...prev, pickupLocation: "" }));
      }
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Ophaallocatie is verplicht";
    }

    if (!bookingData.startDate) {
      newErrors.startDate = "Datum is verplicht";
    } else if (bookingData.startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.startDate = "Datum kan niet in het verleden liggen";
    }

    if (!bookingData.startTime) {
      newErrors.startTime = "Starttijd is verplicht";
    }

    // Guest booking validation - required for all payment methods except invoice
    if (!user && bookingData.paymentMethod !== 'invoice') {
      if (!bookingData.guestName?.trim()) {
        newErrors.guestName = "Naam is verplicht";
      }
      if (!bookingData.guestEmail?.trim()) {
        newErrors.guestEmail = "Email is verplicht";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.guestEmail)) {
        newErrors.guestEmail = "Ongeldig email adres";
      }
      if (!bookingData.guestPhone?.trim()) {
        newErrors.guestPhone = "Telefoonnummer is verplicht";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step validation functions - using useCallback to prevent hoisting issues
  const validateStep1 = useCallback((data: typeof bookingData): boolean => {
    const errors: string[] = [];
    
    if (!data.pickupLocation?.trim()) {
      errors.push("Locatie is verplicht");
    }
    if (!data.startDate) {
      errors.push("Datum is verplicht");
    }
    if (!data.startTime) {
      errors.push("Tijd is verplicht");
    }
    if (!data.duration || data.duration < 1 || data.duration > 24) {
      errors.push("Duur moet tussen 1 en 24 uur zijn");
    }
    
    setStepErrors(prev => ({ ...prev, 1: errors }));
    return errors.length === 0;
  }, []); // Remove bookingData dependency to prevent circular issues

  const validateStep2 = useCallback((data: typeof bookingData): boolean => {
    const errors: string[] = [];
    
    if (!data.vehicleType) {
      errors.push("Selecteer een voertuig");
    }
    if (!data.paymentMethod) {
      errors.push("Selecteer een betaalmethode");
    }
    
    setStepErrors(prev => ({ ...prev, 2: errors }));
    return errors.length === 0;
  }, []); // Remove bookingData dependency

  const validateStep3 = useCallback((data: typeof bookingData): boolean => {
    // Step 3 has no additional validation for hourly bookings
    // Guest info is only required for non-logged in users with non-invoice payment
    return true;
  }, []); // Remove bookingData dependency

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Formulier onvolledig",
        description: "Vul alle verplichte velden correct in.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const totalPrice = calculatePrice();
      
      // Check if user is logged in - only invoice payment requires login
      if (!user && bookingData.paymentMethod === 'invoice') {
        toast({
          title: "Inloggen vereist",
          description: "Log in om een factuur te kunnen aanvragen.",
        });
        navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      
      toast({
        title: "Doorverwijzing naar betaling",
        description: `Uw ${bookingData.duration} uur durende rit - €${totalPrice}`,
      });

      // Navigate directly to payment/wallet page with booking data
      navigate(`${ROUTES.WALLET}?payment=true`, {
        state: { 
          bookingType: 'hourly',
          bookingData, 
          totalPrice,
          paymentAmount: totalPrice
        }
      });
    } catch (error) {
      toast({
        title: "Boeking mislukt",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
  const totalPrice = calculatePrice();

  return (
    <BookingWizard
      currentStep={currentStep}
      totalSteps={3}
      onStepChange={setCurrentStep}
      canAdvanceToStep2={() => validateStep1(bookingData)}
      canAdvanceToStep3={() => validateStep2(bookingData)}
      steps={[
        { title: "Duur & Locatie", description: "Hoe lang en vanuit waar?" },
        { title: "Voertuig", description: "Kies je gewenste voertuig" },
        { title: "Betaling", description: "Bevestig je boeking" }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Step 1: Duration & Location */}
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

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Duur: <span className="text-primary font-semibold">{bookingData.duration} {bookingData.duration === 1 ? 'uur' : 'uren'}</span>
              </Label>
              <Slider
                value={[bookingData.duration]}
                onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: value[0] }))}
                max={24}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1u</span>
                <span>24u</span>
              </div>
            </div>

            {/* Date and Time Selection */}
            <DateTimeSelector
              selectedDate={bookingData.startDate}
              selectedTime={bookingData.startTime}
              onDateChange={(date) => setBookingData(prev => ({ ...prev, startDate: date }))}
              onTimeChange={(time) => setBookingData(prev => ({ ...prev, startTime: time }))}
              minDate={new Date()}
              showQuickActions={true}
              timeStep={30}
              placeholder={{
                date: "Selecteer startdatum",
                time: "Selecteer starttijd"
              }}
            />
            {(errors.startDate || errors.startTime) && (
              <div className="space-y-1">
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate}</p>
                )}
                {errors.startTime && (
                  <p className="text-xs text-destructive">{errors.startTime}</p>
                )}
              </div>
            )}

            {/* Pickup Location */}
            <div className="space-y-2 relative">
        <Label className="text-sm font-medium">Ophaallocatie</Label>
        <Input
          ref={pickupInputRef}
          placeholder="Voer adres in"
          value={bookingData.pickupLocation}
          onChange={(e) => {
            setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }));
            setShowLocationSuggestions(e.target.value.length === 0);
          }}
          onFocus={() => setShowLocationSuggestions(bookingData.pickupLocation.length === 0)}
          onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
          onKeyDown={(e) => {
            // Allow spaces and prevent any interference
            if (e.key === ' ') {
              e.stopPropagation();
              // Don't prevent default - we want the space to be typed
            }
          }}
          className={cn(errors.pickupLocation && "border-destructive")}
        />
        
        {/* Location Suggestions */}
        {showLocationSuggestions && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Current Location */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto p-3 hover:bg-muted bg-primary/5 border border-primary/20"
                onClick={(e) => {
                  e.preventDefault();
                  handleCurrentLocation();
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="text-sm">📍</div>
                  <div>
                    <div className="font-medium text-sm text-primary">Mijn locatie</div>
                    <div className="text-xs text-muted-foreground">Gebruik huidige locatie</div>
                  </div>
                </div>
              </Button>
              
              {/* Preset Locations */}
              <p className="text-xs font-medium text-muted-foreground px-2 py-1 mt-3">Populaire locaties:</p>
              {PRESET_LOCATIONS.map((location, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    setBookingData(prev => ({ 
                      ...prev, 
                      pickupLocation: location.address,
                      pickupCoordinates: location.coordinates
                    }));
                    setShowLocationSuggestions(false);
                    setErrors(prev => ({ ...prev, pickupLocation: "" }));
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{location.icon}</div>
                    <div>
                      <div className="font-medium text-xs">{location.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{location.address}</div>
                    </div>
                  </div>
                </Button>
              ))}
              
              {/* Recent Locations */}
              {recentLocations.length > 0 && (
                <>
                  <div className="border-t pt-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">Recent gebruikt:</p>
                    {recentLocations.map((location, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2 text-xs"
                        onClick={() => {
                          setBookingData(prev => ({ ...prev, pickupLocation: location }));
                          setShowLocationSuggestions(false);
                          setErrors(prev => ({ ...prev, pickupLocation: "" }));
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-2" />
                        {location}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {errors.pickupLocation && (
          <p className="text-xs text-destructive">{errors.pickupLocation}</p>
        )}
      </div>
        </>
      )}

        {/* Step 2: Vehicle & Payment */}
        {currentStep >= 2 && (
          <>
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
            <VehicleSelector
              selectedVehicle={bookingData.vehicleType}
              onVehicleSelect={(vehicleId) => setBookingData(prev => ({ ...prev, vehicleType: vehicleId }))}
              showPricing={true}
              bookingType="hourly"
            />

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Payment Method</Label>
              <Select value={bookingData.paymentMethod} onValueChange={(value) => setBookingData(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
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
          </>
        )}

        {/* Step 3: Final Details & Booking */}
        {currentStep >= 3 && (
          <>
            {/* Guest Information - only show when not logged in and not using invoice */}
            {!user && bookingData.paymentMethod !== 'invoice' && (
              <div className="space-y-4">
                <Label className="text-sm text-muted-foreground">Guest Information</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Naam *</Label>
                      <Input
                        placeholder="Uw volledige naam"
                        value={bookingData.guestName || ''}
                        onChange={(e) => setBookingData(prev => ({ ...prev, guestName: e.target.value }))}
                        onKeyDown={(e) => {
                          // Allow spaces and prevent any interference
                          if (e.key === ' ') {
                            e.stopPropagation();
                            // Don't prevent default - we want the space to be typed
                          }
                        }}
                        className={cn(errors.guestName && "border-destructive")}
                      />
                      {errors.guestName && (
                        <p className="text-sm text-destructive">{errors.guestName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="uw.email@voorbeeld.com"
                        value={bookingData.guestEmail || ''}
                        onChange={(e) => setBookingData(prev => ({ ...prev, guestEmail: e.target.value }))}
                        className={cn(errors.guestEmail && "border-destructive")}
                      />
                      {errors.guestEmail && (
                        <p className="text-sm text-destructive">{errors.guestEmail}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telefoon *</Label>
                      <Input
                        type="tel"
                        placeholder="+32 123 456 789"
                        value={bookingData.guestPhone || ''}
                        onChange={(e) => setBookingData(prev => ({ ...prev, guestPhone: e.target.value }))}
                        onKeyDown={(e) => {
                          // Allow spaces and prevent any interference
                          if (e.key === ' ') {
                            e.stopPropagation();
                            // Don't prevent default - we want the space to be typed
                          }
                        }}
                        className={cn(errors.guestPhone && "border-destructive")}
                      />
                      {errors.guestPhone && (
                        <p className="text-sm text-destructive">{errors.guestPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Display */}
            <div className="bg-primary/5 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Totaalprijs:</span>
                <span className="text-lg font-bold text-primary">€{totalPrice}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Startprijs €35 + {bookingData.duration}u × €{selectedVehicle?.hourlyRate || 25}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Bevestigen...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Boek voor €{totalPrice}
                </>
              )}
            </Button>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center">
              Annulering tot 2 uur voor aanvang gratis
            </p>
          </>
        )}
      </form>
    </BookingWizard>
  );
});