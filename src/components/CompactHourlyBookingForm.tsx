import { useState, useRef } from "react";
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
  Navigation as NavigationIcon,
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



// Simplified time slots
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

interface CompactHourlyBookingData {
  duration: number;
  startDate: Date | null;
  startTime: string;
  pickupLocation: string;
  vehicleType: string;
}

export function CompactHourlyBookingForm() {
  const [bookingData, setBookingData] = useState<CompactHourlyBookingData>({
    duration: 2,
    startDate: null,
    startTime: "",
    pickupLocation: "",
    vehicleType: "standard"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const pickupInputRef = useRef<HTMLInputElement>(null);

  const recentLocations = [
    "Brussels Airport (BRU)",
    "Brussels Central Station",
    "Grand Place, Brussels"
  ];

  // Auto-fill current date and time on mount
  useEffect(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const roundedTime = TIME_SLOTS.find(slot => slot >= currentTime) || TIME_SLOTS[0];
    
    setBookingData(prev => ({
      ...prev,
      startDate: now,
      startTime: roundedTime,
    }));
  }, []);

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocatie niet ondersteund",
        description: "Uw browser ondersteunt geen geolocatie.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Locatie ophalen...",
      description: "Even geduld terwijl we uw locatie bepalen.",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address if Google Maps is available
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          
          geocoder.geocode({ location: latlng }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              setBookingData(prev => ({
                ...prev,
                pickupLocation: results[0].formatted_address,
              }));

              toast({
                title: "Locatie gevonden",
                description: "Uw huidige locatie is ingevuld.",
              });
            } else {
              toast({
                title: "Adres niet gevonden",
                description: "Kon geen adres vinden voor uw locatie.",
                variant: "destructive",
              });
            }
          });
        } else {
          toast({
            title: "Kaart niet beschikbaar",
            description: "Google Maps is niet geladen. Probeer later opnieuw.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        let message = "Kon uw locatie niet bepalen.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Toegang tot locatie is geweigerd. Sta locatietoegang toe in uw browser.";
        }
        toast({
          title: "Locatiefout",
          description: message,
          variant: "destructive",
        });
      }
    );
  };

  // Calculate price
  const calculatePrice = () => {
    const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
    if (!selectedVehicle) return 0;
    
    const basePrice = selectedVehicle.basePrice;
    const hourlyPrice = selectedVehicle.hourlyRate * bookingData.duration;
    return basePrice + hourlyPrice;
  };

  // Get available time slots
  const getAvailableTimeSlots = () => {
    if (!bookingData.startDate) return TIME_SLOTS;
    
    const isToday = bookingData.startDate.toDateString() === new Date().toDateString();
    if (!isToday) return TIME_SLOTS;
    
    const currentHour = new Date().getHours();
    return TIME_SLOTS.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour > currentHour + 1; // 2 hour buffer
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
      
      toast({
        title: "Boeking succesvol!",
        description: `Uw ${bookingData.duration} uur durende rit is geboekt voor €${totalPrice}.`,
      });

      // Navigate to full hourly booking page with pre-filled data
      navigate(`${ROUTES.HOURLY_BOOKING}?prefill=true`, {
        state: { bookingData, totalPrice }
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
  const availableTimeSlots = getAvailableTimeSlots();

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
        <Select
          value={bookingData.startTime}
          onValueChange={(value) => setBookingData(prev => ({ ...prev, startTime: value }))}
        >
          <SelectTrigger className={cn(errors.startTime && "border-destructive")}>
            <SelectValue placeholder="Selecteer tijd" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-40">
              {availableTimeSlots.length > 0 ? availableTimeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              )) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Geen tijden beschikbaar
                </div>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
        {errors.startTime && (
          <p className="text-xs text-destructive">{errors.startTime}</p>
        )}
      </div>

      {/* Pickup Location */}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Ophaallocatie</Label>
          <Button
            type="button"
            variant="taxi-ghost"
            size="sm"
            onClick={getCurrentLocation}
            className="h-6 px-2 text-xs"
          >
            <NavigationIcon className="w-3 h-3 mr-1" />
            Huidige locatie
          </Button>
        </div>
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
                  <NavigationIcon className="h-3 w-3 mr-2" />
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

      {/* Advanced Options Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => navigate(ROUTES.HOURLY_BOOKING)}
      >
        <Plus className="h-3 w-3 mr-1" />
        Meer opties (tussenstops, gast boeking)
      </Button>

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