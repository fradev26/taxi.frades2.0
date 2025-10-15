import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, Users, Shield, Star, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function CityToCityRides() {
  const features = [
    {
      icon: Car,
      title: "Lange afstanden",
  description: "Comfortabele reizen tussen steden door heel België en Europa. Ontspan terwijl wij rijden."
    },
    {
      icon: Clock,
      title: "24/7 beschikbaar",
      description: "Dag en nacht bereikbaar. Boek wanneer het u uitkomt, wij zijn er altijd voor u."
    },
    {
      icon: Users,
      title: "Professionele chauffeurs",
      description: "Discrete, ervaren chauffeurs met uitstekende kennis van lokale routes en verkeer."
    },
    {
      icon: Shield,
      title: "Veilig & betrouwbaar",
      description: "Premium voertuigen, volledig verzekerd met gecertificeerde chauffeurs. Uw veiligheid is onze prioriteit."
    }
  ];

  const popularRoutes = [
    { from: "Amsterdam", to: "Rotterdam", duration: "1u 15min", price: "€85" },
    { from: "Utrecht", to: "Amsterdam", duration: "45 min", price: "€65" },
    { from: "Den Haag", to: "Eindhoven", duration: "1u 30min", price: "€95" },
    { from: "Amsterdam", to: "Brussel", duration: "2u 15min", price: "€150" },
    { from: "Rotterdam", to: "Antwerpen", duration: "1u 30min", price: "€110" },
    { from: "Utrecht", to: "Düsseldorf", duration: "2u 45min", price: "€180" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Stedelijke
              <br />
              <span className="text-blue-400">Ritten</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Stressvrije lange afstand ritten met professionele chauffeurs door heel België en Europa. 
              Ontspan terwijl wij zorgen voor een comfortabele reis naar uw bestemming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4" asChild>
                <Link to="/">
                  Boek nu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4">
                Meer informatie
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Waarom kiezen voor stedelijke ritten?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Geniet van comfort, betrouwbaarheid en professionaliteit tijdens uw reis tussen steden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-200 shadow-2xl rounded-xl text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Populaire routes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Onze meest geboekte stedelijke verbindingen met indicatieve prijzen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="border-2 border-gray-200 shadow-2xl rounded-xl hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-sm">{route.from}</span>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-muted mx-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{route.to}</span>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {route.duration}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">{route.price}</div>
                      <div className="text-xs text-muted-foreground">vanaf</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar om te vertrekken?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Boek uw stedelijke rit vandaag nog en ervaar het comfort van professioneel vervoer tussen steden.
          </p>
          <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4" asChild>
            <Link to="/">
              Boek uw rit nu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
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