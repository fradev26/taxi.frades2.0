import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  Users, 
  CheckCircle, 
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const OverOns = () => {
  const features = [
    {
      icon: MapPin,
      title: "Nauwkeurige locatie",
      description: "GPS-tracking voor exacte ophaal- en bestemmingslocaties zorgt ervoor dat u altijd weet waar uw chauffeur zich bevindt.",
    },
    {
      icon: Clock,
      title: "24/7 beschikbaar",
      description: "Onze service is dag en nacht beschikbaar. Boek wanneer het u uitkomt, zelfs voor last-minute ritten.",
    },
    {
      icon: Shield,
      title: "Veilig reizen",
      description: "Alle chauffeurs zijn gescreend en gecertificeerd. Onze voertuigen ondergaan regelmatige keuringen.",
    },
    {
      icon: Star,
      title: "Premium service",
      description: "Luxe voertuigen, professionele chauffeurs en uitstekende klantenservice voor een onvergetelijke ervaring.",
    },
  ];

  const stats = [
    { label: "Tevreden klanten", value: "50.000+", description: "Klanten vertrouwen op onze service" },
    { label: "Ritten per dag", value: "1.200+", description: "Dagelijks uitgevoerde ritten" },
    { label: "Steden", value: "25+", description: "Actief in heel België" },
    { label: "Chauffeurs", value: "500+", description: "Professionele chauffeurs in dienst" },
  ];

  const services = [
    {
      title: "Luchthaven transfers",
      description: "Betrouwbare transfers naar en van alle grote luchthavens in België en Nederland.",
      features: ["Vluchtmonitoring", "Meet & Greet service", "Bagage assistentie"]
    },
    {
      title: "Zakenvervoer",
      description: "Professioneel vervoer voor zakenafspraken, conferenties en belangrijke meetings.",
      features: ["Discrete service", "WiFi in voertuig", "Flexibele planning"]
    },
    {
      title: "Evenementen",
      description: "Vervoer voor speciale gelegenheden zoals bruiloften, feesten en uitgaansavonden.",
      features: ["Groepsvervoer", "Decoratie mogelijk", "Fotostop service"]
    },
    {
      title: "Dagelijkse ritten",
      description: "Voor uw dagelijkse verplaatsingen binnen de stad of tussen steden.",
      features: ["Vaste chauffeur mogelijk", "Abonnement tarieven", "App booking"]
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
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://www.mercedes-benz.co.za/content/dam/hq/passengercars/cars/s-class/s-class-saloon-wv223-pi/overview/stage/09-2022/images/mercedes-benz-s-class-wv223-stage-3840x1707-09-2022.jpg/1757426873806.jpg?im=Crop,rect=(1923,0,1707,1707);Resize=(828,828)')`,
          }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center text-white space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold">
              Over FRADES
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              De meest betrouwbare chauffeursdienst van België. 
              Al meer dan 10 jaar uw partner voor professioneel vervoer.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20">
        
        {/* About Section */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Waarom kiezen voor FRADES?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sinds onze oprichting hebben we ons gespecialiseerd in het leveren van uitstekende 
              chauffeursdiensten. Van luchthaven transfers tot zakelijke ritten, 
              wij zorgen ervoor dat u altijd comfortabel en op tijd arriveert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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

        {/* Stats Section */}
  <section className="bg-muted/30 rounded-2xl p-8 md:p-12 luxury-solid-bg luxury-rounded">
          <div className="text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              FRADES in cijfers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Onze diensten
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Van luchthaven transfers tot zakelijke ritten, 
              wij bieden een breed scala aan vervoersdiensten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-semibold">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
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

        {/* Contact CTA */}
        <section className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Klaar om te boeken?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Ervaar zelf waarom duizenden klanten kiezen voor FRADES. 
            Boek vandaag nog uw eerste rit en ontdek het verschil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg" className="text-lg px-8">
              <Link to="/">
                <Car className="w-5 h-5 mr-2" />
                Boek nu
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/contact">
                <Phone className="w-5 h-5 mr-2" />
                Contact
              </Link>
            </Button>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default OverOns;