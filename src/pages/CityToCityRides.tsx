import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Shield, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function CityToCityRides() {
  const features = [
    {
      icon: MapPin,
      title: "Lange afstanden",
      description: "Comfortabele reizen tussen steden in heel België en Europa"
    },
    {
      icon: Clock,
      title: "24/7 beschikbaar",
      description: "Boek op elk moment van de dag, elke dag van de week"
    },
    {
      icon: Users,
      title: "Professionele chauffeurs",
      description: "Ervaren chauffeurs met kennis van lokale routes"
    },
    {
      icon: Shield,
      title: "Veilig & betrouwbaar",
      description: "Volledig verzekerde voertuigen en gecertificeerde chauffeurs"
    }
  ];

  const popularRoutes = [
    { from: "Brussel", to: "Antwerpen", duration: "45 min", price: "€65" },
    { from: "Gent", to: "Brugge", duration: "30 min", price: "€45" },
    { from: "Antwerpen", to: "Rotterdam", duration: "1u 15min", price: "€95" },
    { from: "Brussel", to: "Amsterdam", duration: "2u 30min", price: "€150" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              City-to-city rides
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Uw stressvrije oplossing voor lange afstand ritten met professionele chauffeurs door heel Europa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/">Boek nu</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                Meer informatie
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Waarom kiezen voor onze city-to-city service?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Geniet van comfort, betrouwbaarheid en professionaliteit tijdens uw reis tussen steden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Routes */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Populaire routes
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Onze meest geboekte city-to-city verbindingen met indicatieve prijzen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold">{route.from}</span>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-muted mx-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{route.to}</span>
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {route.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{route.price}</div>
                      <div className="text-xs text-muted-foreground">vanaf</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-muted/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Klaar om te vertrekken?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Boek uw city-to-city rit vandaag nog en ervaar het comfort van professioneel vervoer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/">Boek uw rit</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact opnemen</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}