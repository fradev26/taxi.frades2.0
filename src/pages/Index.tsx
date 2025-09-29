import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/BookingForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Clock, Shield, Star, Users } from "lucide-react";
import { APP_CONFIG } from "@/constants";

const Index = () => {
  const features = [
    {
      icon: MapPin,
      title: "Nauwkeurige locatie",
      description: "GPS-tracking voor exacte ophaal- en bestemmingslocaties",
    },
    {
      icon: Clock,
      title: "24/7 beschikbaar",
      description: "Boek je rit wanneer het jou uitkomt, dag en nacht",
    },
    {
      icon: Shield,
      title: "Veilig reizen",
      description: "Geverifieerde chauffeurs en betrouwbare voertuigen",
    },
    {
      icon: Star,
      title: "Top beoordelingen",
      description: "Hoge klanttevredenheid en uitstekende service",
    },
  ];

  const stats = [
    { label: "Tevreden klanten", value: "50K+" },
    { label: "Ritten per dag", value: "1.2K+" },
    { label: "Steden", value: "25+" },
    { label: "Chauffeurs", value: "500+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Booking Form */}
      <section className="relative min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://www.mercedes-benz.co.za/content/dam/hq/passengercars/cars/s-class/s-class-saloon-wv223-pi/overview/stage/09-2022/images/mercedes-benz-s-class-wv223-stage-3840x1707-09-2022.jpg/1757426873806.jpg?im=Crop,rect=(1923,0,1707,1707);Resize=(828,828)')`
          }}
        />
        
        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            
            {/* Left Side - Hero Text */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  The global chauffeur service
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
                  Professionele chauffeursdienst voor al uw vervoersbehoeften. 
                  Betrouwbaar, comfortabel en altijd op tijd.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="taxi-primary" size="lg" className="text-lg px-8">
                  <Car className="w-5 h-5 mr-2" />
                  Meer informatie
                </Button>
                <Button variant="taxi-outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-black">
                  <Users className="w-5 h-5 mr-2" />
                  Voor bedrijven
                </Button>
              </div>
            </div>

            {/* Right Side - Booking Form */}
            <div className="flex justify-center lg:justify-end">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 md:pb-6">
        {/* CTA Section */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Klaar om te vertrekken?
            </h2>
            <p className="text-xl text-muted-foreground">
              Download de app en boek direct je eerste rit. 
              Nieuwe gebruikers krijgen €10 korting!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="taxi-primary" size="lg" className="text-lg px-8">
                Account aanmaken
              </Button>
              <Button variant="taxi-outline" size="lg" className="text-lg px-8">
                Meer informatie
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;