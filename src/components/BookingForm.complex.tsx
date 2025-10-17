import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DateTimeSelector } from "@/components/ui/datetime-selector";
import { 
  MapPin, 
  Clock, 
  Car, 
  Crown,
  Users,
  Euro,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Map,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { STANDARD_VEHICLES } from "@/config/vehicles";
import { initializeGoogleMaps, waitForGoogleMapsAPI, isGoogleMapsAPILoaded } from "@/utils/googleMaps";
import { Card, CardContent } from "@/components/ui/card";

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

interface BookingFormData {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  vehicleType: string;
  stopovers: any[];
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  paymentMethod: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export const BookingForm = React.memo(function BookingForm() {
  const [bookingData, setBookingData] = useState<BookingFormData>({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    vehicleType: "economy",
    stopovers: [],
    paymentMethod: "ideal",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Google Maps state
  const [map, setMap] = useState<any>(null);
  const [pickupMarker, setPickupMarker] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googlePlacesResults, setGooglePlacesResults] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Step validation
  const isStep1Complete = () => {
    return bookingData.pickup.trim() !== "" && 
           bookingData.destination.trim() !== "" &&
           bookingData.date !== "" && 
           bookingData.time !== "";
  };

  const isStep2Complete = () => {
    return isStep1Complete() && bookingData.vehicleType !== "";
  };

  const canProceedToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return isStep1Complete();
    if (step === 3) return isStep2Complete();
    return false;
  };

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
                const location = {
                  address: address,
                  coordinates: { lat: latitude, lng: longitude }
                };
                handleLocationSelect(location);
                
                toast({
                  title: "Locatie gevonden",
                  description: "Uw huidige locatie is ingesteld als ophaallocatie.",
                });
              } else {
                // Fallback to coordinates display
                const location = {
                  address: 'Mijn huidige locatie',
                  coordinates: { lat: latitude, lng: longitude }
                };
                handleLocationSelect(location);
              }
            });
          } else {
            const location = {
              address: 'Mijn huidige locatie',
              coordinates: { lat: latitude, lng: longitude }
            };
            handleLocationSelect(location);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          const location = {
            address: 'Mijn huidige locatie',
            coordinates: { lat: latitude, lng: longitude }
          };
          handleLocationSelect(location);
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

  // Initialize Google Maps
  useEffect(() => {
    const setupGoogleMaps = async () => {
      if (!showMap) return;

      try {
        if (!isGoogleMapsAPILoaded()) {
          await initializeGoogleMaps();
        }
        await waitForGoogleMapsAPI();
        
        setGoogleMapsLoaded(true);
        setupMapAndAutocomplete();
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        toast({
          title: "Kaart niet beschikbaar",
          description: "Google Maps kon niet worden geladen.",
          variant: "destructive",
        });
      }
    };

    const setupMapAndAutocomplete = () => {
      if (!window.google || !mapRef.current) return;

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

  // Google Places search
  const searchGooglePlaces = async (query: string) => {
    if (!window.google || !query.trim() || !map) return;

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
          setGooglePlacesResults(formattedResults);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log('CompactHourly: No places found for query:', query);
          setGooglePlacesResults([]);
        } else {
          console.error('CompactHourly Places API error:', status);
          setGooglePlacesResults([]);
        }
      });
    } catch (error) {
      console.error('CompactHourly: Error searching places:', error);
      setGooglePlacesResults([]);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    setBookingData(prev => ({
      ...prev,
      pickupLocation: location.address,
      pickupCoordinates: location.coordinates
    }));
    setShowLocationSuggestions(false);
    setGooglePlacesResults([]);
    setErrors(prev => ({ ...prev, pickupLocation: "" }));
    
    // Update map marker
    if (map && location.coordinates) {
      if (pickupMarker) {
        pickupMarker.setMap(null);
      }
      
      const newMarker = new window.google.maps.Marker({
        position: location.coordinates,
        map: map,
        title: 'Ophaaladres',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        }
      });
      
      setPickupMarker(newMarker);
      map.setCenter(location.coordinates);
      map.setZoom(15);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) return;

    setIsSubmitting(true);
    try {
      const totalPrice = calculatePrice();
      
      toast({
        title: "Boeking bevestigd!",
        description: `Uw uurhuur van ${bookingData.duration} uur is bevestigd voor €${totalPrice}`,
      });

      // Reset form
      setBookingData({
        duration: 2,
        startDate: null,
        startTime: "",
        pickupLocation: "",
        pickupCoordinates: undefined,
        vehicleType: "economy",
        paymentMethod: "ideal",
        guestName: "",
        guestEmail: "",
        guestPhone: ""
      });
      setCurrentStep(1);
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

  const handleNext = () => {
    if (currentStep === 1 && isStep1Complete()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Complete()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
  const totalPrice = calculatePrice();

  return (
    <div className="space-y-6">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {[
          { num: 1, label: "Locatie & Tijd" },
          { num: 2, label: "Voertuig" },
          { num: 3, label: "Betaling" }
        ].map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${currentStep === step.num ? 'bg-primary text-white' : 
                  currentStep > step.num ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
              `}>
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span className="text-xs mt-1 text-center">{step.label}</span>
            </div>
            {index < 2 && (
              <div className={`
                flex-1 h-1 mx-4
                ${currentStep > step.num ? 'bg-green-200' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Locatie + Tijd */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Waar en wanneer?</h3>
              <p className="text-sm text-muted-foreground">Vul uw ophaallocatie en gewenste tijd in</p>
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Duur: <span className="text-primary font-semibold">{bookingData.duration} {bookingData.duration === 1 ? 'uur' : 'uren'}</span>
              </Label>
              <Slider
                value={[bookingData.duration]}
                onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: value[0] }))}
                max={8}
                min={1}
                step={1}
                className="w-full !rounded-full !shadow-lg"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1u</span>
                <span>8u</span>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Datum en tijd
              </Label>
              <DateTimeSelector
                selectedDate={bookingData.startDate}
                selectedTime={bookingData.startTime}
                onDateChange={(date) => setBookingData(prev => ({ ...prev, startDate: date }))}
                onTimeChange={(time) => setBookingData(prev => ({ ...prev, startTime: time }))}
                minDate={new Date()}
                showQuickActions={true}
                timeStep={15}
                placeholder={{
                  date: "Selecteer datum",
                  time: "Selecteer tijd"
                }}
              />
            </div>

            {/* Pickup Location */}
            <div className="space-y-3 relative">
              <Label className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                Ophaallocatie
              </Label>
              <Input
                ref={pickupInputRef}
                placeholder="Voer adres in"
                value={bookingData.pickupLocation}
                onChange={(e) => {
                  setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }));
                  const value = e.target.value;
                  if (value.length === 0) {
                    setShowLocationSuggestions(true);
                    setGooglePlacesResults([]);
                  } else if (value.length >= 2) {
                    setShowLocationSuggestions(true);
                    // Debounce search
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    searchTimeoutRef.current = setTimeout(() => {
                      searchGooglePlaces(value);
                    }, 400);
                  } else {
                    setShowLocationSuggestions(false);
                    setGooglePlacesResults([]);
                  }
                }}
                onFocus={() => {
                  if (bookingData.pickupLocation.length === 0) {
                    setShowLocationSuggestions(true);
                  } else if (bookingData.pickupLocation.length >= 2) {
                    setShowLocationSuggestions(true);
                    searchGooglePlaces(bookingData.pickupLocation);
                  }
                }}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 300)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowLocationSuggestions(false);
                    setGooglePlacesResults([]);
                  }
                }}
                className={cn(errors.pickupLocation && "border-destructive")}
                autoComplete="off"
              />
              
              {/* Location Suggestions */}
              {showLocationSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-xl border-2 border-primary/20 max-h-80 overflow-y-auto bg-background/95 luxury-solid-bg">
                  <CardContent className="p-2">
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
                    
                    {/* Google Places Results */}
                    {googlePlacesResults.length > 0 && (
                      <>
                        <p className="text-xs font-medium text-muted-foreground px-2 py-1 mt-3">Zoekresultaten:</p>
                        {googlePlacesResults.map((place, index) => (
                          <Button
                            key={`google-${index}`}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLocationSelect(place);
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
                        <hr className="my-2" />
                      </>
                    )}

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
                          handleLocationSelect({
                            name: location.name,
                            address: location.address,
                            coordinates: location.coordinates
                          });
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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Map Container - only show if we have a pickup location */}
            {bookingData.pickupLocation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Map className="w-4 h-4" />
                  <span>Locatie overzicht</span>
                </div>
                <div className="relative w-full h-48 rounded-lg border overflow-hidden">
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
                    style={{ minHeight: '192px' }}
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStep1Complete()}
              className="w-full"
              size="lg"
            >
              Volgende: Voertuig kiezen
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Voertuig kiezen */}
        {currentStep === 2 && canProceedToStep(2) && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Kies uw voertuig</h3>
              <p className="text-sm text-muted-foreground">Selecteer het voertuig dat bij u past</p>
            </div>

            <div className="grid gap-4">
              {STANDARD_VEHICLES.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={cn(
                    "border-2 rounded-lg p-4 cursor-pointer transition-colors",
                    bookingData.vehicleType === vehicle.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setBookingData(prev => ({ ...prev, vehicleType: vehicle.id }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{vehicle.icon}</div>
                      <div>
                        <h4 className="font-semibold">{vehicle.name}</h4>
                        <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{vehicle.capacity} personen</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">€{vehicle.hourlyRate}/u</div>
                      <div className="text-sm text-muted-foreground">+ €{vehicle.basePrice} start</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vorige
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStep2Complete()}
                className="flex-1"
              >
                Volgende: Betaling
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Betaling */}
        {currentStep === 3 && canProceedToStep(3) && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Betaling</h3>
              <p className="text-sm text-muted-foreground">Controleer uw boeking en betaal</p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Samenvatting</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Locatie:</span>
                  <span className="text-right">{bookingData.pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Datum & tijd:</span>
                  <span>{bookingData.startDate?.toLocaleDateString()} {bookingData.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duur:</span>
                  <span>{bookingData.duration} {bookingData.duration === 1 ? 'uur' : 'uren'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voertuig:</span>
                  <span>{selectedVehicle?.name}</span>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Totaalprijs:</span>
                <span className="text-2xl font-bold text-primary">€{totalPrice}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Startprijs €{selectedVehicle?.basePrice} + {bookingData.duration}u × €{selectedVehicle?.hourlyRate}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Betaalmethode</Label>
              <Select
                value={bookingData.paymentMethod}
                onValueChange={(value) => setBookingData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ideal">iDEAL</SelectItem>
                  <SelectItem value="card">Creditcard</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vorige
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
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
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          Annulering tot 2 uur voor aanvang gratis
        </p>
      </form>
    </div>
  );
});