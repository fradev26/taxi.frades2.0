import { useState, useRef, useEffect } from "react";
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

interface CompactHourlyBookingData {
  duration: number;
  startDate: Date | null;
  startTime: string;
  pickupLocation: string;
  vehicleType: string;
  paymentMethod: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export function CompactHourlyBookingForm() {
  const [bookingData, setBookingData] = useState<CompactHourlyBookingData>({
    duration: 2,
    startDate: null,
    startTime: "",
    pickupLocation: "",
    vehicleType: "standard",
    paymentMethod: "direct"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
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
          pickupLocation: place.formatted_address || place.name || ""
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Duration Selection */}
      <div className="space-y-2">
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
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1u</span>
          <span>8u</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Datum</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !bookingData.startDate && "text-muted-foreground",
                errors.startDate && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {bookingData.startDate ? (
                format(bookingData.startDate, "PPP", { locale: nl })
              ) : (
                "Selecteer datum"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={bookingData.startDate || undefined}
              onSelect={(date) => setBookingData(prev => ({ ...prev, startDate: date || null }))}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.startDate && (
          <p className="text-xs text-destructive">{errors.startDate}</p>
        )}
      </div>

      {/* Time Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Starttijd</Label>
        <Input
          type="time"
          value={bookingData.startTime}
          onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
          className={cn(errors.startTime && "border-destructive")}
        />
        {errors.startTime && (
          <p className="text-xs text-destructive">{errors.startTime}</p>
        )}
      </div>

      {/* Pickup Location */}
      <div className="space-y-2 relative">
        <Label className="text-sm font-medium">Ophaallocatie</Label>
        <Input
          ref={pickupInputRef}
          placeholder="Voer adres in"
          value={bookingData.pickupLocation}
          onChange={(e) => {
            setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }));
            setShowLocationSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowLocationSuggestions(bookingData.pickupLocation.length > 0)}
          className={cn(errors.pickupLocation && "border-destructive")}
        />
        
        {/* Location Suggestions */}
        {showLocationSuggestions && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border rounded-md shadow-md">
            <div className="p-2 space-y-1">
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs text-primary"
                onClick={() => setShowLocationSuggestions(false)}
              >
                Sluiten
              </Button>
            </div>
          </div>
        )}
        
        {errors.pickupLocation && (
          <p className="text-xs text-destructive">{errors.pickupLocation}</p>
        )}
      </div>

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
    </form>
  );
}