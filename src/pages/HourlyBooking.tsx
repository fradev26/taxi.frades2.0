import { useState } from "react";
import { SimpleHourlyBookingForm } from "@/components/SimpleHourlyBookingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, MapPin, Car, ArrowLeft } from "lucide-react";
import type { HourlyBookingData } from "@/types";

interface BookingConfirmation extends HourlyBookingData {
  totalPrice: number;
}

export default function HourlyBooking() {
  const [bookingConfirmed, setBookingConfirmed] = useState<BookingConfirmation | null>(null);

  const handleBookingSuccess = (booking: BookingConfirmation) => {
    setBookingConfirmed(booking);
  };

  const handleBookingCancel = () => {
    setBookingConfirmed(null);
  };

  const resetBooking = () => {
    setBookingConfirmed(null);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <Card className="border-green-200 bg-green-50 luxury-rounded">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Boeking Bevestigd!</CardTitle>
              <p className="text-green-600">
                Uw uurservice is succesvol geboekt. U ontvangt binnen enkele minuten een bevestigingsmail.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-4 space-y-4 luxury-solid-bg">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Boekingsdetails
                </h3>
                
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duur:</span>
                    <span className="font-medium">{bookingConfirmed.duration} uren</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Datum & Tijd:</span>
                    <span className="font-medium">
                      {bookingConfirmed.startDate?.toLocaleDateString('nl-NL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} om {bookingConfirmed.startTime}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Ophaallocatie:</span>
                    <span className="font-medium text-right max-w-60">{bookingConfirmed.pickupLocation}</span>
                  </div>
                  
                  {bookingConfirmed.stopovers.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Tussenstops:</span>
                      <div className="text-right max-w-60 space-y-1">
                        {bookingConfirmed.stopovers.map((stopover, index) => (
                          <div key={stopover.id} className="text-sm">
                            <span className="font-medium">{stopover.address}</span>
                            <span className="text-muted-foreground ml-2">({stopover.duration} min)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voertuigtype:</span>
                    <Badge variant="secondary">{bookingConfirmed.vehicleType}</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Totaalprijs:</span>
                  <span className="text-primary">€{bookingConfirmed.totalPrice}</span>
                </div>
              </div>

              {/* Contact information */}
              {(bookingConfirmed.guestName || bookingConfirmed.guestEmail || bookingConfirmed.guestPhone) && (
                <div className="bg-white rounded-lg p-4 space-y-3 luxury-solid-bg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Contactgegevens
                  </h3>
                  
                  <div className="grid gap-2 text-sm">
                    {bookingConfirmed.guestName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Naam:</span>
                        <span className="font-medium">{bookingConfirmed.guestName}</span>
                      </div>
                    )}
                    {bookingConfirmed.guestEmail && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{bookingConfirmed.guestEmail}</span>
                      </div>
                    )}
                    {bookingConfirmed.guestPhone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefoon:</span>
                        <span className="font-medium">{bookingConfirmed.guestPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Wat gebeurt er nu?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• U ontvangt een bevestigingsmail met alle details</li>
                  <li>• Onze chauffeur neemt 15 minuten voor aanvang contact op</li>
                  <li>• U kunt uw boeking tot 2 uur van tevoren kosteloos annuleren</li>
                  <li>• Bij vragen kunt u contact opnemen via +32 123 456 789</li>
                </ul>
              </div>

              <Button 
                onClick={resetBooking}
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Nieuwe boeking maken
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Uurservice Boeking</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Huur een chauffeur per uur voor maximale flexibiliteit. Perfect voor 
            zakelijke afspraken, sightseeing of meerdere bestemmingen.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Flexibele duur</h3>
              <p className="text-sm text-muted-foreground">
                Boek van 1 tot 12 uur, precies zo lang als u nodig heeft
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Meerdere stops</h3>
              <p className="text-sm text-muted-foreground">
                Voeg zoveel tussenstops toe als u wilt, wij wachten op u
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Premium service</h3>
              <p className="text-sm text-muted-foreground">
                Professionele chauffeurs en verschillende voertuigklassen
              </p>
            </CardContent>
          </Card>
        </div>

  {/* Booking Form */}
  <Card className="w-full max-w-lg mx-auto bg-card/95 border-border/50 shadow-2xl luxury-solid-bg luxury-rounded">
          <CardContent className="p-6">
            <SimpleHourlyBookingForm
              onBookingSuccess={handleBookingSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}