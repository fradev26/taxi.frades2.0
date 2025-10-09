import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BookingInterface } from "@/components/BookingInterface";
import { ServicesSection } from "@/components/ServicesSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Clock, Shield, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "@/constants";

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
      <section className="relative flex items-center py-8 md:py-12">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://www.mercedes-benz.co.za/content/dam/hq/passengercars/cars/s-class/s-class-saloon-wv223-pi/overview/stage/09-2022/images/mercedes-benz-s-class-wv223-stage-3840x1707-09-2022.jpg/1757426873806.jpg?im=Crop,rect=(1923,0,1707,1707);Resize=(828,828)')`,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
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
                <Button asChild variant="taxi-primary" size="lg" className="text-lg px-8">
                  <Link to={ROUTES.OVER_ONS}>
                    <Car className="w-5 h-5 mr-2" />
                    Meer informatie
                  </Link>
                </Button>
                <Button asChild variant="taxi-outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-black">
                  <Link to={ROUTES.VOOR_BEDRIJVEN}>
                    <Users className="w-5 h-5 mr-2" />
                    Voor bedrijven
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side - Booking Interface */}
            <div className="flex justify-center lg:justify-end">
              <BookingInterface />
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
              <Button asChild variant="taxi-primary" size="lg" className="text-lg px-8">
                <Link to={ROUTES.LOGIN}>
                  Account aanmaken
                </Link>
              </Button>
              <Button asChild variant="taxi-outline" size="lg" className="text-lg px-8">
                <Link to={ROUTES.OVER_ONS}>
                  Meer informatie
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      {/** BEGIN: UI uit image.png **/}
      <ServicesSection />
      {/** EINDE **/}
      
      <Footer />
    </div>
  );
};

export default Index;