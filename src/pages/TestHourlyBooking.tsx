import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function TestHourlyBooking() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Test Hourly Booking Pagina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Deze test pagina laadt succesvol! Het probleem ligt waarschijnlijk in de HourlyBookingForm component.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 space-y-4">
              <p>Als je deze pagina ziet, betekent dit dat:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>✅ De routing werkt correct</li>
                <li>✅ React componenten laden zonder problemen</li>
                <li>✅ De development server reageert normaal</li>
              </ul>
              
              <Button onClick={() => window.location.reload()}>
                Herlaad pagina om te testen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}