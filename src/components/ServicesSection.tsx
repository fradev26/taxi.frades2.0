import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Car, Plane, Clock, Smartphone, PartyPopper } from 'lucide-react';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isNew?: boolean;
  comingSoon?: boolean;
  href: string;
}

const services: ServiceCard[] = [
  // Duplicaten verwijderd
  {
    id: 'airport-transfers',
    title: 'Airport & Port Transfers',
    description: 'Vervoer naar luchthavens en cruise terminals, inclusief tracking en wachttijd.',
    icon: Plane,
    href: '/services/airport-transfers',
  },
  {
    id: 'hourly-hire',
    title: 'Privéchauffeur',
    description: 'Flexibel en comfortabel vervoer per uur of dag.',
    icon: Clock,
    href: '/services/private-chauffeur',
  },
  {
    id: 'horeca-events',
    title: 'Horeca & Events',
    description: 'VIP-vervoer voor horeca, events en gasten.',
    icon: PartyPopper,
    isNew: true,
    href: '/services/horeca-events',
  },
  {
    id: 'chauffeur-hailing',
    title: 'On-demand Chauffeur',
    description: 'Boek direct via app. Chauffeur binnen minuten.',
    icon: Smartphone,
    comingSoon: true,
    href: '/services/chauffeur-hailing',
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/** BEGIN: UI uit image.png **/}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Onze diensten
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Professioneel vervoer voor elke gelegenheid. Van zakelijke afspraken tot speciale evenementen.
          </p>
        </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        {/** EINDE **/}
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: ServiceCard }) {
  const IconComponent = service.icon;
  
  return (
  <a href={service.href} tabIndex={0} aria-disabled={service.comingSoon} className={`group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-200 bg-card shadow-2xl rounded-xl flex flex-col h-full relative focus:outline-none focus:ring-2 focus:ring-emerald-500`}>
      {/* Icon Header */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        {(service.isNew || service.comingSoon) && (
          <Badge 
            className={`absolute top-4 right-4 text-white font-medium px-3 py-1 text-xs ${
              service.comingSoon 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {service.comingSoon ? 'BINNENKORT' : 'NIEUW'}
          </Badge>
        )}
        <h3 className="text-xl font-bold text-card-foreground mb-2 leading-tight">
          {service.title}
        </h3>
      </div>
      <div className="p-6 flex flex-col flex-grow cursor-pointer">
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow text-center min-h-[48px] flex items-center justify-center">
          {service.description}
        </p>
      </div>
    </a>
  );
}