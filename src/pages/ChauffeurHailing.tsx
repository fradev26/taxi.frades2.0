import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Clock, Users, Star, Zap, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function ChauffeurHailing() {
  const comingSoonFeatures = [
    {
      icon: Smartphone,
      title: "App-based booking",
      description: "Boek in seconden via onze geavanceerde mobiele app"
    },
    {
      icon: Clock,
      title: "Directe beschikbaarheid",
      description: "Chauffeurs binnen minuten beschikbaar in uw buurt"
    },
    {
      icon: Users,
      title: "Premium chauffeurs",
      description: "Ervaar de kwaliteit van traditionele chauffeurs met moderne gemak"
    },
    {
      icon: Star,
      title: "Luxe ervaring",
      description: "Hoogwaardige voertuigen en professionele service"
    }
  ];

  const upcomingFeatures = [
  "Real-time tracking van uw chauffeur",
  "Transparante prijzen vooraf bekend",
  "Cashless betalingen via app",
  "Beoordelingen en feedback systeem",
  "Favoriete chauffeurs opslaan",
  "Groepsboekingen mogelijk"
  ];

  const benefits = [
    {
      title: "Sneller dan traditionele taxi's",
      description: "Gemiddeld 40% snellere ophaaltijden"
    },
    {
      title: "Betere prijs-kwaliteit verhouding", 
      description: "Premium service tegen concurrerende tarieven"
    },
    {
      title: "Betrouwbaarheid gegarandeerd",
      description: "Geen onverwachte no-shows of lange wachttijden"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section verwijderd */}

      <div className="container mx-auto px-4 py-16">
        {/* Coming Soon Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Wat kunt u verwachten?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Een revolutionaire manier van chauffeur service met moderne technologie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                    <feature.icon className="w-8 h-8 text-black" />
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

        {/* Benefits Section verwijderd */}

        {/* Upcoming Features List */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Functies in ontwikkeling
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        {/* Timeline Section verwijderd */}

        {/* Notification Signup removed per request */}
      </div>
      <Footer />
    </div>
  );
}