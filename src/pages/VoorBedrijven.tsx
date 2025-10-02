import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Clock, Euro, FileText, TrendingUp, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function VoorBedrijven() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Euro,
      title: "Kostenefficiënt",
      description: "Vaste tarieven en transparante prijzen. Geen verrassingen, alleen betrouwbare service.",
    },
    {
      icon: Clock,
      title: "Tijdsbesparing",
      description: "Uw werknemers kunnen productief zijn tijdens het reizen in plaats van zelf te rijden.",
    },
    {
      icon: FileText,
      title: "Factuurgemak",
      description: "Gedetailleerde facturen en rapportages voor eenvoudige administratie en controle.",
    },
    {
      icon: TrendingUp,
      title: "Schaalbaarheid",
      description: "Groei met ons mee. Van enkele ritten per maand tot dagelijks vervoer voor uw team.",
    },
  ];

  const features = [
    {
      title: "Luchthavenoverdrachten",
      description: "Professioneel vervoer van en naar alle grote luchthavens. Altijd op tijd, altijd betrouwbaar.",
    },
    {
      title: "Zakelijke meetings",
      description: "Comfortabel vervoer naar uw zakelijke afspraken. Bereid u voor in de auto met WiFi aan boord.",
    },
    {
      title: "Corporate events",
      description: "Vervoer voor uw bedrijfsevenementen, conferenties en teambuilding activiteiten.",
    },
    {
      title: "VIP-service",
      description: "Premium vervoer voor belangrijke klanten en zakelijke gasten.",
    },
  ];

  const packages = [
    {
      title: "Starter",
      description: "Perfect voor kleine bedrijven",
      features: [
        "Tot 50 ritten per maand",
        "Standaard voertuigen",
        "Factuur per maand",
        "Email support",
      ],
      highlight: false,
    },
    {
      title: "Business",
      description: "Voor groeiende organisaties",
      features: [
        "Onbeperkt aantal ritten",
        "Premium voertuigen",
        "Account manager",
        "Prioritaire support",
        "Maandelijkse rapportages",
      ],
      highlight: true,
    },
    {
      title: "Enterprise",
      description: "Op maat voor grote bedrijven",
      features: [
        "Alles uit Business",
        "Dedicated voertuigen",
        "24/7 VIP support",
        "Custom integraties",
        "SLA garanties",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent-green/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <Building className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Zakelijk <span className="text-primary">Vervoer</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Professionele vervoersoplossingen voor uw bedrijf. Betrouwbaar, comfortabel en kostenefficiënt.
            </p>
            <Button 
              variant="taxi-primary" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              <Users className="w-5 h-5 mr-2" />
              Vraag een offerte aan
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Waarom kiezen voor FRADES?</h2>
            <p className="text-xl text-muted-foreground">
              De voordelen van zakelijk vervoer met ons
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Onze diensten</h2>
            <p className="text-xl text-muted-foreground">
              Alles wat uw bedrijf nodig heeft
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Onze pakketten</h2>
            <p className="text-xl text-muted-foreground">
              Kies het pakket dat bij uw bedrijf past
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-shadow ${
                  pkg.highlight ? 'border-primary border-2' : ''
                }`}
              >
                <CardHeader>
                  {pkg.highlight && (
                    <div className="text-xs font-semibold text-primary mb-2">POPULAIR</div>
                  )}
                  <CardTitle className="text-2xl">{pkg.title}</CardTitle>
                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-accent-green" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={pkg.highlight ? "taxi-primary" : "taxi-outline"}
                    className="w-full"
                    onClick={() => navigate(ROUTES.LOGIN)}
                  >
                    Contact opnemen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent-green/10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Klaar om te starten?
            </h2>
            <p className="text-xl text-muted-foreground">
              Neem contact met ons op voor een persoonlijk gesprek over uw zakelijke vervoersbehoeften
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-6 text-center space-y-3">
                  <Phone className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-bold">Bel ons</h3>
                  <p className="text-muted-foreground">+32 2 XXX XX XX</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center space-y-3">
                  <Mail className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-bold">Email ons</h3>
                  <p className="text-muted-foreground">business@frades.be</p>
                </CardContent>
              </Card>
            </div>
            <Button 
              variant="taxi-primary" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Vraag een offerte aan
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
