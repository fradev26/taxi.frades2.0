import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle, 
  TrendingUp,
  Car,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Mail,
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";

const VoorBedrijven = () => {
  const businessFeatures = [
    {
      icon: Building,
      title: "Zakelijke accounts",
      description: "Gecentraliseerd beheer van alle bedrijfsritten met gedetailleerde rapportage en facturering.",
    },
    {
      icon: Users,
      title: "Meerdere gebruikers",
      description: "Voeg eenvoudig medewerkers toe aan uw account en beheer hun vervoersbehoeften centraal.",
    },
    {
      icon: Clock,
      title: "24/7 beschikbaarheid",
      description: "Voor urgente zaken of late meetings - onze service is altijd beschikbaar.",
    },
    {
      icon: Shield,
      title: "Betrouwbaarheid",
      description: "Geverifieerde chauffeurs en hoogwaardige voertuigen voor uw belangrijke zakenpartners.",
    },
  ];

  const businessSolutions = [
    {
      title: "Airport Business",
      description: "Professionele luchthaven transfers voor uw medewerkers en gasten",
      features: [
        "Vluchtmonitoring en aanpassingen",
        "Meet & Greet service met naambord",
        "Directe facturering naar bedrijf",
        "VIP lounges toegang mogelijk"
      ],
      icon: MapPin
    },
    {
      title: "Daily Business",
      description: "Dagelijkse vervoersoplossingen voor uw bedrijfsactiviteiten",
      features: [
        "Vaste chauffeurs voor vertrouwdheid",
        "Flexibele planning en wijzigingen",
        "Discrete en professionele service",
        "WiFi en laadpunten in voertuigen"
      ],
      icon: Calendar
    },
    {
      title: "Events & Conferenties",
      description: "Groepsvervoer voor bedrijfsevenementen en conferenties",
      features: [
        "Groepsvervoer met meerdere voertuigen",
        "Gecoördineerde aankomst- en vertrektijden",
        "Speciale tarieven voor grote groepen",
        "Evenement planning ondersteuning"
      ],
      icon: Users
    },
    {
      title: "Executive Service",
      description: "Premium service voor directie en belangrijke gasten",
      features: [
        "Luxe voertuigen (Mercedes S-Klasse, BMW 7-serie)",
        "Ervaren en discrete chauffeurs",
        "Persoonlijke account manager access",
        "Priority booking en support"
      ],
      icon: TrendingUp
    }
  ];

  const benefits = [
    {
      title: "Kostenbeheersing",
      description: "Transparante prijzen en gedetailleerde rapportage helpen bij budgetbeheer.",
      icon: Calculator
    },
    {
      title: "Tijdsbesparing",
      description: "Uw medewerkers kunnen productief zijn tijdens het reizen.",
      icon: Clock
    },
    {
      title: "Professionele uitstraling",
      description: "Maak indruk op klanten en partners met onze premium service.",
      icon: Building
    },
    {
      title: "Flexibiliteit",
      description: "Eenvoudig aanpassen van ritten en last-minute wijzigingen mogelijk.",
      icon: CheckCircle
    }
  ];

  const pricingPlans = [
    {
      name: "Business Starter",
      price: "Vanaf €50/maand",
      description: "Perfect voor kleine bedrijven",
      features: [
        "Tot 10 ritten per maand",
        "Basis rapportage",
        "Email support",
        "Factuur per maand"
      ],
      recommended: false
    },
    {
      name: "Business Professional", 
      price: "Vanaf €150/maand",
      description: "Voor groeiende bedrijven",
      features: [
        "Tot 50 ritten per maand",
        "Uitgebreide rapportage",
        "Priority support",
        "Maandelijkse account review",
        "Volume kortingen"
      ],
      recommended: true
    },
    {
      name: "Business Enterprise",
      price: "Op maat",
      description: "Voor grote organisaties",
      features: [
        "Onbeperkte ritten",
        "Dedicated account manager",
        "Custom rapportage",
        "24/7 telefoon support",
        "SLA garanties",
        "API integratie mogelijk"
      ],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2187&q=80')`,
          }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center text-white space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold">
              FRADES voor Bedrijven
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Professionele vervoersoplossingen voor uw bedrijf. 
              Van dagelijkse ritten tot VIP transfers - wij regelen het.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                <FileText className="w-5 h-5 mr-2" />
                Offerte aanvragen
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-black">
                <Phone className="w-5 h-5 mr-2" />
                Bel ons
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20">
        
        {/* Features Section */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Waarom bedrijven kiezen voor FRADES
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meer dan 1000 bedrijven vertrouwen op onze professionele vervoersdiensten. 
              Ontdek waarom ook uw bedrijf zou moeten kiezen voor FRADES.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessFeatures.map((feature, index) => (
              <Card key={index} className="text-center h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Business Solutions */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Onze zakelijke oplossingen
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Van luchthaven transfers tot directie vervoer - 
              wij hebben de juiste oplossing voor elke zakelijke behoefte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {businessSolutions.map((solution, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <solution.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">{solution.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{solution.description}</p>
                  <div className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <div className="text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Voordelen voor uw bedrijf
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Zakelijke tariefplannen
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Kies het plan dat het beste past bij de behoeften van uw bedrijf. 
              Alle plannen zijn maandelijks opzegbaar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.recommended ? 'ring-2 ring-primary' : ''}`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Aanbevolen
                    </span>
                  </div>
                )}
                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="text-3xl font-bold text-primary">{plan.price}</div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant={plan.recommended ? "default" : "outline"}
                  >
                    {plan.name === "Business Enterprise" ? "Contact opnemen" : "Start vandaag"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Klaar om te starten?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Sluit u aan bij meer dan 1000 bedrijven die al vertrouwen op FRADES 
            voor hun zakelijke vervoersbehoeften.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8">
              <FileText className="w-5 h-5 mr-2" />
              Gratis offerte
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
              <Phone className="w-5 h-5 mr-2" />
              +32 123 456 789
            </Button>
          </div>
          <p className="text-sm opacity-75">
            Geen verborgen kosten • Maandelijks opzegbaar • 24/7 support
          </p>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default VoorBedrijven;