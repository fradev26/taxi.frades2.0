import { useState, useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateTimeSelector } from "@/components/ui/datetime-selector";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Minus, 
  Car, 
  Crown,
  Users,
  Euro,
  Info,
  Navigation,
  X,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { VehicleSelector } from "@/components/VehicleSelector";
import { STANDARD_VEHICLES } from "@/config/vehicles";
import { initializeGoogleMaps, waitForGoogleMapsAPI, isGoogleMapsAPILoaded } from "@/utils/googleMaps";
import { PAYMENT_METHODS } from "@/constants";

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

interface Stopover {
  id: string;
  address: string;
  duration: number; // minutes
}

interface HourlyBookingData {
  duration: number; // hours
  startDate: Date | null;
  startTime: string;
  pickupLocation: string;
  pickupCoords?: { lat: number; lng: number };
  stopovers: Stopover[];
  vehicleType: string;
  paymentMethod: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

interface HourlyBookingFormProps {
  onBookingSuccess?: (booking: HourlyBookingData & { totalPrice: number }) => void;
  onBookingCancel?: () => void;
  showCancelButton?: boolean;
}

export const HourlyBookingForm = memo(function HourlyBookingForm({ 
  onBookingSuccess, 
  onBookingCancel, 
  showCancelButton = false 
}: HourlyBookingFormProps) {
  const [bookingData, setBookingData] = useState<HourlyBookingData>({
    duration: 2,
    startDate: null,
    startTime: "",
    pickupLocation: "",
    stopovers: [], // Keep for backwards compatibility but hide UI
    vehicleType: "standard",
    paymentMethod: "direct",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [recentLocations] = useState([
    "Brussels Airport (BRU)",
    "Brussels Central Station",
    "Grand Place, Brussels",
    "European Quarter, Brussels",
    "Antwerp Central Station"
  ]);

  const { toast } = useToast();
  const { user } = useAuth();

  // Reset payment method if user logs out and credit was selected
  useEffect(() => {
    if (!user && bookingData.paymentMethod === 'credit') {
      setBookingData(prev => ({ ...prev, paymentMethod: 'direct' }));
    }
  }, [user, bookingData.paymentMethod]);
  const pickupInputRef = useRef<HTMLInputElement>(null);

  // Calculate total price
  const calculatePrice = () => {
    const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
    if (!selectedVehicle) return 0;
    
    const basePrice = selectedVehicle.basePrice;
    const hourlyPrice = selectedVehicle.hourlyRate * bookingData.duration;
    // Removed stopover surcharge for simplification
    
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
                  pickupCoords: { lat: latitude, lng: longitude }
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

  // Add stopover
  const addStopover = () => {
    const newStopover: Stopover = {
      id: `stopover-${Date.now()}`,
      address: "",
      duration: 15
    };
    setBookingData(prev => ({
      ...prev,
      stopovers: [...prev.stopovers, newStopover]
    }));
  };

  // Remove stopover
  const removeStopover = (id: string) => {
    setBookingData(prev => ({
      ...prev,
      stopovers: prev.stopovers.filter(s => s.id !== id)
    }));
  };

  // Update stopover
  const updateStopover = (id: string, field: keyof Stopover, value: string | number) => {
    setBookingData(prev => ({
      ...prev,
      stopovers: prev.stopovers.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      )
    }));
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

    // Check if start time is in the past for today
    if (bookingData.startDate && bookingData.startTime) {
      const selectedDateTime = new Date(bookingData.startDate);
      const [hours, minutes] = bookingData.startTime.split(':').map(Number);
      selectedDateTime.setHours(hours, minutes);
      
      if (selectedDateTime < new Date()) {
        newErrors.startTime = "Starttijd kan niet in het verleden liggen";
      }
    }

    if (bookingData.duration < 1 || bookingData.duration > 12) {
  newErrors.duration = "Duur moet tussen 1 en 24 uur zijn";
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

    // Validate stopovers
    bookingData.stopovers.forEach((stopover, index) => {
      if (!stopover.address.trim()) {
        newErrors[`stopover-${index}`] = "Tussenstop adres is verplicht";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalPrice = calculatePrice();
      
      toast({
        title: "Boeking succesvol!",
        description: `Uw ${bookingData.duration} uur durende rit is geboekt voor €${totalPrice}.`,
      });

      onBookingSuccess?.({
        ...bookingData,
        totalPrice
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

  // Initialize Google Maps lazily
  useEffect(() => {
    let isMounted = true;
    
    const setupGoogleMaps = async () => {
      try {
        // Only load Google Maps when component is mounted and focused
        if (!isMounted) return;
        
        // Load Google Maps API if not already loaded
        if (!isGoogleMapsAPILoaded()) {
          await initializeGoogleMaps();
        }

        // Check if still mounted after async operation
        if (!isMounted) return;

        // Wait for API to be ready
        await waitForGoogleMapsAPI();
        
        if (isMounted) {
          setGoogleMapsLoaded(true);
          setupAutocomplete();
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load Google Maps:', error);
          // Show toast to user about maps not working
          toast({
            title: "Locatie autocomplete niet beschikbaar",
            description: "U kunt nog steeds handmatig een adres invoeren.",
            variant: "destructive",
          });
          setGoogleMapsLoaded(false);
        }
      }
    };

    // Delay loading to avoid blocking initial render
    const timer = setTimeout(setupGoogleMaps, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Setup autocomplete for pickup location
  const setupAutocomplete = () => {
    if (!window.google || !pickupInputRef.current) return;

    try {
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
          
          setBookingData(prev => ({
            ...prev,
            pickupLocation: place.formatted_address || place.name || "",
            pickupCoords: { lat, lng }
          }));
          
          setShowLocationSuggestions(false);
          setErrors(prev => ({ ...prev, pickupLocation: "" }));
        }
      });
    } catch (error) {
      console.warn('Google Maps autocomplete niet beschikbaar:', error);
    }
  };

  const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
  const totalPrice = calculatePrice();

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      role="form"
      aria-label="Hourly taxi booking form"
    >
            {/* Duration Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <Label className="text-lg font-semibold">Duur van de rit</Label>
              </div>
              
              <div className="space-y-4">
                <div className="px-4">
                  <Slider
                    value={[bookingData.duration]}
                    onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: value[0] }))}
                    max={24}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 uur</span>
                  <span className="font-semibold text-lg text-primary">
                    {bookingData.duration} {bookingData.duration === 1 ? 'uur' : 'uren'}
                  </span>
                  <span>24 uren</span>
                </div>

                {errors.duration && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errors.duration}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <Separator />

            {/* Date and Time Selection */}
            <DateTimeSelector
              selectedDate={bookingData.startDate}
              selectedTime={bookingData.startTime}
              onDateChange={(date) => {
                setBookingData(prev => ({ ...prev, startDate: date }));
                setErrors(prev => ({ ...prev, startDate: "" }));
              }}
              onTimeChange={(time) => {
                setBookingData(prev => ({ ...prev, startTime: time }));
                setErrors(prev => ({ ...prev, startTime: "" }));
              }}
              minDate={new Date()}
              showQuickActions={true}
              timeStep={30}
              placeholder={{
                date: "Selecteer startdatum",
                time: "Selecteer starttijd"
              }}
              className="md:max-w-md"
            />
            {(errors.startDate || errors.startTime) && (
              <div className="space-y-1">
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime}</p>
                )}
              </div>
            )}
            
            {bookingData.startDate && bookingData.startDate.toDateString() === new Date().toDateString() && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Boekingen moeten minimaal 2 uur van tevoren worden gemaakt.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Pickup Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span>From</span>
              </div>
              
              <div className="relative">
                <Input
                  ref={pickupInputRef}
                  placeholder="Address, airport, hotel, ..."
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
                  className={cn(
                    "border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary",
                    errors.pickupLocation && "border-destructive"
                  )}
                />
                
                {showLocationSuggestions && (
                  <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border max-h-80 overflow-y-auto">
                    <CardContent className="p-2">
                      <div className="space-y-1">
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
                                pickupCoords: location.coordinates
                              }));
                              setShowLocationSuggestions(false);
                              setErrors(prev => ({ ...prev, pickupLocation: "" }));
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
                        
                        {/* Recent Locations */}
                        {recentLocations.length > 0 && (
                          <>
                            <div className="border-t pt-2">
                              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Recent gebruikt:</p>
                              {recentLocations.map((location, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-left h-auto p-2 hover:bg-primary/10"
                                  onClick={() => {
                                    setBookingData(prev => ({ ...prev, pickupLocation: location }));
                                    setShowLocationSuggestions(false);
                                    setErrors(prev => ({ ...prev, pickupLocation: "" }));
                                  }}
                                >
                                  <Navigation className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {location}
                                </Button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {errors.pickupLocation && (
                <p className="text-sm text-destructive">{errors.pickupLocation}</p>
              )}
            </div>

            {/* Stopovers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Label className="font-semibold">Tussenstops (optioneel)</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStopover}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Toevoegen
                </Button>
              </div>

              {bookingData.stopovers.map((stopover, index) => (
                <Card key={stopover.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Stop {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStopover(stopover.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="Adres van tussenstop"
                            value={stopover.address}
                            onChange={(e) => updateStopover(stopover.id, 'address', e.target.value)}
                            className={cn(errors[`stopover-${index}`] && "border-destructive")}
                          />
                          {errors[`stopover-${index}`] && (
                            <p className="text-xs text-destructive mt-1">{errors[`stopover-${index}`]}</p>
                          )}
                        </div>
                        
                        <Select
                          value={stopover.duration.toString()}
                          onValueChange={(value) => updateStopover(stopover.id, 'duration', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="10">10 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 uur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {bookingData.stopovers.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Elke tussenstop kost €5 extra. De wachttijd wordt meegerekend in de totale uurprijs.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

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

            {/* Guest Information - only show when not logged in and not using invoice */}
            {!user && bookingData.paymentMethod !== 'invoice' && (
              <div className="space-y-4">
                <Label className="text-sm text-muted-foreground">Guest Information</Label>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
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

            {/* Price Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Euro className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Prijsoverzicht</h3>
                  </div>

                  {selectedVehicle && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Startprijs ({selectedVehicle.name}):</span>
                        <span>€{selectedVehicle.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uurprijs ({bookingData.duration} uren à €{selectedVehicle.hourlyRate}):</span>
                        <span>€{selectedVehicle.hourlyRate * bookingData.duration}</span>
                      </div>
                      {bookingData.stopovers.length > 0 && (
                        <div className="flex justify-between">
                          <span>Tussenstops ({bookingData.stopovers.length} × €5):</span>
                          <span>€{bookingData.stopovers.length * 5}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Totaal:</span>
                        <span className="text-primary">€{totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Prijzen zijn inclusief BTW. Tolwegen en parkeerkosten zijn niet inbegrepen.
                      Annulering tot 2 uur voor aanvang is gratis.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary Preview */}
            {bookingData.pickupLocation && bookingData.startDate && bookingData.startTime && (
              <Card className="bg-accent/30 border-accent">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Boekingssamenvatting
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">Uurservice - {bookingData.duration} {bookingData.duration === 1 ? 'uur' : 'uren'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Datum & Tijd:</span>
                      <span className="font-medium">
                        {format(bookingData.startDate, "PPP", { locale: nl })} om {bookingData.startTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Ophaallocatie:</span>
                      <span className="font-medium text-right max-w-48">{bookingData.pickupLocation}</span>
                    </div>
                    {bookingData.stopovers.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tussenstops:</span>
                        <span className="font-medium">{bookingData.stopovers.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voertuig:</span>
                      <span className="font-medium">{selectedVehicle?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {showCancelButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBookingCancel}
                  className="flex-1"
                >
                  Annuleren
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-lg py-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Bevestigen...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Boeking bevestigen - €{totalPrice}
                  </>
                )}
              </Button>
            </div>
    </form>
  );
});