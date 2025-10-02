import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Clock, Shield, Star, Users, Award, Target, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function OverOns() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Shield,
      title: "Veiligheid",
      description: "Uw veiligheid staat bij ons voorop. Al onze chauffeurs zijn gescreend en gecertificeerd.",
    },
    {
      icon: Star,
      title: "Kwaliteit",
      description: "We streven naar de hoogste kwaliteit in service en comfort voor elke rit.",
    },
    {
      icon: Heart,
      title: "Klanttevredenheid",
      description: "Uw tevredenheid is ons doel. We gaan altijd een stap verder voor onze klanten.",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Betrouwbaar vervoer",
      description: "Van luchthavens tot zakelijke bijeenkomsten, we zorgen dat u altijd op tijd aankomt.",
    },
    {
      icon: Clock,
      title: "24/7 beschikbaar",
      description: "Onze service is dag en nacht beschikbaar voor al uw vervoersbehoeften.",
    },
    {
      icon: Users,
      title: "Professionele chauffeurs",
      description: "Ervaren, vriendelijke chauffeurs die bekend zijn met de regio.",
    },
    {
      icon: Award,
      title: "Premium service",
      description: "Luxe voertuigen en eersteklas service voor een comfortabele reis.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent-green/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Over <span className="text-primary">FRADES</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Uw betrouwbare partner voor professioneel chauffeurvervoer
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Wie zijn wij?
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>
                  FRADES is een premium chauffeursdienst die zich specialiseert in hoogwaardig 
                  personenvervoer. Met jarenlange ervaring in de sector bieden wij betrouwbare 
                  en comfortabele vervoersoplossingen voor particulieren en bedrijven.
                </p>
                <p>
                  Ons team van professionele chauffeurs staat klaar om u te vervoeren naar elke 
                  bestemming, of het nu gaat om zakelijke meetings, luchthavenoverdrachten, of 
                  speciale gelegenheden. We combineren luxe, betrouwbaarheid en een persoonlijke 
                  benadering.
                </p>
                <p>
                  Bij FRADES staat kwaliteit voorop. Onze moderne vloot bestaat uit premium 
                  voertuigen die regelmatig worden onderhouden en uitgerust zijn met alle 
                  moderne voorzieningen voor uw comfort.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80" 
                alt="Luxury vehicle" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Onze waarden</h2>
            <p className="text-xl text-muted-foreground">
              Wat ons drijft en onderscheidt
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Wat we bieden</h2>
            <p className="text-xl text-muted-foreground">
              Onze diensten en voordelen
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-accent-green" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent-green/10">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Klaar om met ons te rijden?
          </h2>
          <p className="text-xl text-muted-foreground">
            Boek nu uw eerste rit en ervaar het verschil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="taxi-primary" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <Car className="w-5 h-5 mr-2" />
              Boek een rit
            </Button>
            <Button 
              variant="taxi-outline" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              <Users className="w-5 h-5 mr-2" />
              Account aanmaken
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
