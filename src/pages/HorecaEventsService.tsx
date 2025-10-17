import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PartyPopper, Users, Calendar, Star, Phone, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export function HorecaEventsService() {
  const benefits = [
    {
      icon: Users,
      title: 'VIP-behandeling',
      description: 'Luxe vervoer en professionele chauffeurs voor uw gasten.'
    },
    {
      icon: Calendar,
      title: 'Event integratie',
      description: 'Perfecte planning en tijdige aankomst voor elk event.'
    },
    {
      icon: Star,
      title: 'Premium service',
      description: 'Exclusieve voertuigen en persoonlijke aandacht.'
    }
  ];

  const services = [
  'Restaurant shuttle voor gasten',
  'Hotel pick-up & drop-off',
  'Bruiloft & event vervoer',
  'Zakelijk vervoer',
  'VIP gasten vervoer',
  'Festival & concert shuttle'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section verwijderd */}

      {/* Benefits Section */}
  <section className="py-20 bg-muted/30 luxury-solid-bg">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Waarom kiezen voor onze partnerships?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Versterk uw service met professioneel vervoer dat perfect aansluit bij uw kwaliteitsnormen.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 border-gray-200 shadow-2xl rounded-xl text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.08)] flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="w-8 h-8 text-black" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Partnership diensten
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Voor horeca, events en bedrijven. Altijd een passende vervoersoplossing voor uw gasten.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                    <span className="text-foreground">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="border-2 border-gray-200 shadow-2xl rounded-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Start uw partnership
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Neem contact op voor een persoonlijk gesprek over de mogelijkheden 
                    en voorwaarden van onze exclusieve partnerships.
                  </p>
                  <div className="space-y-4">
                    {/* Boek een afspraak knop verwijderd */}
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      taxi@frades.be
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section verwijderd */}

      <Footer />
    </div>
  );
}

export default HorecaEventsService;