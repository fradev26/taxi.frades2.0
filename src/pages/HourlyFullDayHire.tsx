import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Star, Calendar, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function HourlyFullDayHire() {
  const features = [
    {
      icon: Clock,
      title: "Flexibele uren",
      description: "Boek per uur of voor een hele dag, volledig naar uw planning"
    },
    {
      icon: Users,
      title: "Persoonlijke chauffeur",
      description: "Uw eigen professionele chauffeur voor de hele duur van de boeking"
    },
    {
      icon: MapPin,
      title: "Meerdere bestemmingen",
      description: "Bezoek meerdere locaties zonder extra kosten voor wachttijd"
    },
    {
      icon: Star,
      title: "Premium comfort",
      description: "Luxe voertuigen met alle voorzieningen voor langere ritten"
    }
  ];

  const packages = [
    {
      title: "4 Uur Package",
      duration: "4 uur",
      price: "€180",
      description: "Perfect voor zakelijke afspraken of sightseeing",
      includes: [
        "4 uur chauffeur service",
        "Tot 50km inbegrepen",
        "Wachttijd inbegrepen",
        "Luxe voertuig"
      ],
      popular: false
    },
    {
      title: "8 Uur Package",
      duration: "8 uur", 
      price: "€320",
      description: "Ideaal voor een volledige dag business of toerisme",
      includes: [
        "8 uur chauffeur service",
        "Tot 150km inbegrepen", 
        "Onbeperkte stops",
        "Premium voertuig",
        "Gratis wifi"
      ],
      popular: true
    },
    {
      title: "12 Uur Package",
      duration: "12 uur",
      price: "€450", 
      description: "Voor uitgebreide tours of lange zakelijke dagen",
      includes: [
        "12 uur chauffeur service",
        "Tot 250km inbegrepen",
        "Onbeperkte stops",
        "Premium voertuig",
        "Verfrissingen inbegrepen"
      ],
      popular: false
    }
  ];

  const useCases = [
    {
      title: "Zakelijke bijeenkomsten",
      description: "Bezoek meerdere kantoren of afspraken op één dag",
      icon: "🏢"
    },
    {
      title: "Sightseeing tours",
      description: "Ontdek de mooiste plekken met uw persoonlijke gids-chauffeur",
      icon: "📸"
    },
    {
      title: "Shopping trips",
      description: "Comfortabel winkelen zonder parkeergedoe",
      icon: "🛍️"
    },
    {
      title: "Event transport",
      description: "Bruiloften, conferenties en andere speciale gelegenheden",
      icon: "🎉"
    },
    {
      title: "Medische afspraken",
      description: "Betrouwbaar vervoer voor ziekenhuis- en artsbezoeken",
      icon: "🏥"
    },
    {
      title: "Luchthaven wachttijd",
      description: "Blijf in comfort wachten tijdens lange overstappen",
      icon: "✈️"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600/90 to-indigo-700/90 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Hourly and full day hire
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Voor per-uur boekingen of dagelijkse chauffeur diensten, kies voor onze op maat gemaakte services voor totale flexibiliteit, betrouwbaarheid en comfort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/hourly-booking">Boek nu</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600">
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
              Waarom onze uurverhuur service?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Maximale flexibiliteit en comfort voor al uw vervoersbehoeften.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                    <feature.icon className="w-8 h-8 text-purple-600" />
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

        {/* Packages Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Onze packages
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Kies het package dat het beste bij uw behoeften past.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative hover:shadow-lg transition-shadow ${pkg.popular ? 'border-purple-500 border-2' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600">
                    Meest populair
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.title}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600 mt-2">{pkg.price}</div>
                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.includes.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={pkg.popular ? "default" : "outline"} asChild>
                    <Link to="/hourly-booking">Boek {pkg.duration}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Perfect voor
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Onze uurverhuur service is ideaal voor verschillende situaties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-purple-50 dark:bg-purple-950/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Klaar voor uw persoonlijke chauffeur?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Boek uw uurverhuur service en geniet van maximale flexibiliteit en comfort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/hourly-booking">Start boeking</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Offerte aanvragen</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}