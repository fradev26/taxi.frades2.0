import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, Shield, CheckCircle, Luggage, Navigation as NavigationIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function AirportTransfers() {
  const features = [
    {
      icon: Plane,
      title: "Vlucht tracking",
      description: "We volgen uw vlucht en passen de ophaaltijd automatisch aan bij vertragingen"
    },
    {
      icon: Clock,
      title: "Extra wachttijd",
      description: "Gratis wachttijd inbegrepen voor bagage ophalen en douane"
    },
    {
      icon: Shield,
      title: "Betrouwbare service",
      description: "Onze chauffeurs zijn er altijd op tijd, ongeacht het weer of verkeer"
    },
    {
      icon: Luggage,
      title: "Bagageservice",
      description: "Hulp bij het laden en lossen van uw bagage"
    }
  ];

  const airports = [
    {
      name: "Brussels Airport (BRU)",
      location: "Zaventem",
      distance: "12 km van Brussel centrum",
      time: "25-35 min",
      price: "€45"
    },
    {
      name: "Charleroi Airport (CRL)",
      location: "Charleroi",
      distance: "60 km van Brussel centrum", 
      time: "60-75 min",
      price: "€75"
    },
    {
      name: "Antwerp Airport (ANR)",
      location: "Antwerpen",
      distance: "8 km van Antwerpen centrum",
      time: "15-20 min", 
      price: "€35"
    },
    {
      name: "Schiphol Airport (AMS)",
      location: "Amsterdam",
      distance: "175 km van Brussel",
      time: "2u 15min",
      price: "€140"
    }
  ];

  const benefits = [
    "Geen verborgen kosten",
    "24/7 beschikbaar",
    "Professionele chauffeurs",
    "Luxe voertuigen",
    "Vaste tarieven",
    "Gratis annulering tot 24u voor vertrek"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600/90 to-blue-800/90 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-500 hover:bg-blue-600">
              Vlucht tracking inbegrepen
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Airport transfers
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Met extra wachttijd en vlucht tracking bij vertragingen is onze service geoptimaliseerd om elke luchthaven transfer moeiteloos te maken.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/">Boek transfer</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Bekijk tarieven
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
              Waarom onze luchthaven transfers?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stressvrij reizen naar en van de luchthaven met onze professionele service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <feature.icon className="w-8 h-8 text-blue-600" />
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

        {/* Airports Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ondersteunde luchthavens
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We bieden transfers naar alle grote luchthavens in de regio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {airports.map((airport, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{airport.name}</CardTitle>
                      <p className="text-muted-foreground">{airport.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{airport.price}</div>
                      <div className="text-xs text-muted-foreground">vanaf</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <NavigationIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{airport.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{airport.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Onze voordelen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-blue-50 dark:bg-blue-950/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Uw vlucht staat klaar?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Boek uw luchthaven transfer en reis zorgeloos naar uw bestemming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/">Boek transfer</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Vragen? Contact ons</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}