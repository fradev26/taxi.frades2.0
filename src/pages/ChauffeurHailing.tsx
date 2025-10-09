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
    "Verschillende voertuigcategorieën",
    "24/7 klantenservice",
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600/90 to-teal-700/90 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-500 hover:bg-blue-600 text-lg px-4 py-2">
              🚀 COMING SOON
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Chauffeur hailing
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Geniet van de kwaliteit van een traditionele chauffeur, met het gemak van binnen enkele minuten na boeking kunnen rijden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" disabled>
                Binnenkort beschikbaar
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-emerald-600" asChild>
                <Link to="#notify">Notificatie ontvangen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

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
              <Card key={index} className="text-center hover:shadow-lg transition-shadow opacity-90">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-emerald-100 rounded-full w-fit">
                    <feature.icon className="w-8 h-8 text-emerald-600" />
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

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Waarom wachten op chauffeur hailing?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-emerald-600">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

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
                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ontwikkelings roadmap
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">Q1 2026 - App Development</h3>
                  <p className="text-muted-foreground text-sm">Ontwikkeling van de mobiele app en backend systemen</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-muted/10 rounded-lg">
                <div className="w-4 h-4 bg-muted-foreground rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold">Q2 2026 - Beta Testing</h3>
                  <p className="text-muted-foreground text-sm">Closed beta met geselecteerde gebruikers</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-muted/10 rounded-lg">
                <div className="w-4 h-4 bg-muted-foreground rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold">Q3 2026 - Launch</h3>
                  <p className="text-muted-foreground text-sm">Officiële lancering van de chauffeur hailing service</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Signup */}
        <section id="notify" className="text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Wees de eerste die het weet
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Meld u aan voor onze nieuwsbrief en ontvang een notificatie zodra chauffeur hailing beschikbaar is.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact">Notificatie aanvragen</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">Ontdek andere services</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}