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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateTimeSelector } from "@/components/ui/enhanced-datetime-selector";
import { BookingWizard } from "@/components/ui/booking-wizard";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Car, 
  Users,
  Euro,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { VehicleSelector } from "@/components/VehicleSelector";
import { STANDARD_VEHICLES } from "@/config/vehicles";
import { PAYMENT_METHODS } from "@/constants";

interface HourlyBookingFormProps {
  onBookingSuccess?: (booking: any) => void;
}

export const SimpleHourlyBookingForm = memo(function SimpleHourlyBookingForm({ 
  onBookingSuccess 
}: HourlyBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    pickupLocation: "",
    duration: 2,
    vehicleType: "standard",
    passengers: 1,
    luggage: 0,
    paymentMethod: "direct" as const,
    startDate: new Date(),
    notes: "",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset payment method if user logs out and credit was selected
  useEffect(() => {
    if (!user && bookingData.paymentMethod === 'credit') {
      setBookingData(prev => ({ ...prev, paymentMethod: 'direct' }));
    }
  }, [user, bookingData.paymentMethod]);

  // Calculate total price
  const calculatePrice = () => {
    const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === bookingData.vehicleType);
    if (!selectedVehicle) return 0;
    
    const basePrice = selectedVehicle.hourlyRate * bookingData.duration;
    return Math.round(basePrice * 100) / 100;
  };

  // Validation functions for wizard steps
  const validateStep1 = (data: typeof bookingData) => {
    return data.pickupLocation.trim().length > 0 && data.duration >= 1;
  };

  const validateStep2 = (data: typeof bookingData) => {
    return validateStep1(data) && data.vehicleType && data.passengers >= 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Ophaaladres is verplicht";
    }
    
    if (!user) {
      if (!bookingData.guestName.trim()) {
        newErrors.guestName = "Naam is verplicht";
      }
      if (!bookingData.guestEmail.trim()) {
        newErrors.guestEmail = "E-mail is verplicht";
      }
      if (!bookingData.guestPhone.trim()) {
        newErrors.guestPhone = "Telefoonnummer is verplicht";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const totalPrice = calculatePrice();
      
      // Simulate booking submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Boeking succesvol!",
        description: `Uw uurservice van ${bookingData.duration} uur is geboekt.`,
      });

      if (onBookingSuccess) {
        onBookingSuccess({
          ...bookingData,
          totalPrice,
          id: Date.now().toString()
        });
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Fout bij boeken",
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
            {/* Pickup Location */}
            <div className="space-y-2">
              <Label htmlFor="pickup">Ophaaladres *</Label>
              <Input
                id="pickup"
                value={bookingData.pickupLocation}
                onChange={(e) => {
                  setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }));
                  setErrors(prev => ({ ...prev, pickupLocation: "" }));
                }}
                placeholder="Voer uw ophaaladres in..."
                className={cn(errors.pickupLocation && "border-destructive")}
              />
              {errors.pickupLocation && (
                <p className="text-sm text-destructive">{errors.pickupLocation}</p>
              )}
            </div>

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
                    onValueChange={([value]) => setBookingData(prev => ({ ...prev, duration: value }))}
                    max={12}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                
                <div className="text-center">
                  <Badge variant="secondary" className="px-4 py-1 text-lg">
                    {bookingData.duration} {bookingData.duration === 1 ? 'uur' : 'uren'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Date/Time */}
            <div className="space-y-2">
              <Label>Startdatum en tijd</Label>
              <DateTimeSelector
                date={bookingData.startDate}
                onDateTimeChange={(date) => setBookingData(prev => ({ ...prev, startDate: date }))}
              />
            </div>
          </>
        )}

        {/* Step 2: Vehicle Selection */}
        {currentStep === 2 && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <Label className="text-lg font-semibold">Voertuig</Label>
              </div>
              <VehicleSelector
                selectedVehicle={bookingData.vehicleType}
                onVehicleSelect={(vehicleId) => setBookingData(prev => ({ ...prev, vehicleType: vehicleId }))}
                showHourlyRates={true}
              />
            </div>

            {/* Passengers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passengers">Passagiers</Label>
                <Select
                  value={bookingData.passengers.toString()}
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, passengers: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'persoon' : 'personen'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="luggage">Bagage</Label>
                <Select
                  value={bookingData.luggage.toString()}
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, luggage: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'koffer' : 'koffers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Payment & Guest Info */}
        {currentStep === 3 && (
          <>

        {/* Guest Info (if not logged in) */}
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle>Contactgegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Naam *</Label>
                <Input
                  id="guestName"
                  value={bookingData.guestName}
                  onChange={(e) => {
                    setBookingData(prev => ({ ...prev, guestName: e.target.value }));
                    setErrors(prev => ({ ...prev, guestName: "" }));
                  }}
                  className={cn(errors.guestName && "border-destructive")}
                />
                {errors.guestName && (
                  <p className="text-sm text-destructive">{errors.guestName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail">E-mail *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={bookingData.guestEmail}
                  onChange={(e) => {
                    setBookingData(prev => ({ ...prev, guestEmail: e.target.value }));
                    setErrors(prev => ({ ...prev, guestEmail: "" }));
                  }}
                  className={cn(errors.guestEmail && "border-destructive")}
                />
                {errors.guestEmail && (
                  <p className="text-sm text-destructive">{errors.guestEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">Telefoonnummer *</Label>
                <Input
                  id="guestPhone"
                  value={bookingData.guestPhone}
                  onChange={(e) => {
                    setBookingData(prev => ({ ...prev, guestPhone: e.target.value }));
                    setErrors(prev => ({ ...prev, guestPhone: "" }));
                  }}
                  className={cn(errors.guestPhone && "border-destructive")}
                />
                {errors.guestPhone && (
                  <p className="text-sm text-destructive">{errors.guestPhone}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Betaalmethode</Label>
          <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.filter(method => method.id !== 'credit' || user).map((method) => (
              <div
                key={method.id}
                className={cn(
                  "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                  bookingData.paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.id as any }))}
              >
                <div className="flex-1">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                </div>
                <div className="flex items-center">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2",
                    bookingData.paymentMethod === method.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Voertuig: {selectedVehicle?.name}</span>
                <span>€{selectedVehicle?.hourlyRate}/uur</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duur: {bookingData.duration} uur</span>
                <span>€{totalPrice}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Totaal</span>
                <span>€{totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Price Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voertuig: {selectedVehicle?.name}</span>
                    <span>€{selectedVehicle?.hourlyRate}/uur</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duur: {bookingData.duration} uur</span>
                    <span>€{totalPrice}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Totaal</span>
                    <span>€{totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Betaalmethode</Label>
              <div className="grid grid-cols-1 gap-3">
                {PAYMENT_METHODS.filter(method => method.id !== 'credit' || user).map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                      bookingData.paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.id as any }))}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                    <div className="flex items-center">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2",
                        bookingData.paymentMethod === method.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Boeken..." : `Boek nu voor €${totalPrice}`}
            </Button>
          </>
        )}
      </form>
    </BookingWizard>
  );
});