import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  image: string;
  isNew?: boolean;
  comingSoon?: boolean;
  href: string;
}

const services: ServiceCard[] = [
  {
    id: 'city-to-city',
    title: 'City-to-city rides',
    description: 'Your stress-free solution for long-distance rides with professional chauffeurs across the globe.',
    image: 'https://images.unsplash.com/photo-1549317336-206569e8475c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    href: '/services/city-to-city',
  },
  {
    id: 'airport-transfers',
    title: 'Airport transfers',
    description: 'With additional wait time and flight tracking in case of delays, our service is optimized to make every airport transfer a breeze.',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    href: '/services/airport-transfers',
  },
  {
    id: 'hourly-hire',
    title: 'Hourly and full day hire',
    description: 'For by-the-hour bookings or daily chauffeur hire, choose one of our tailored services for total flexibility, reliability and comfort.',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    href: '/services/hourly-full-day',
  },
  {
    id: 'chauffeur-hailing',
    title: 'Chauffeur hailing',
    description: 'Enjoy the quality of a traditional chauffeur, with the convenience of riding within minutes of booking.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    isNew: true,
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
            Our services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
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
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border bg-card shadow-lg rounded-lg flex flex-col h-full">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {service.isNew && (
          <Badge 
            className={`absolute top-4 left-4 text-white font-medium px-3 py-1 text-xs ${
              service.comingSoon 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {service.comingSoon ? 'COMING SOON' : 'NEW'}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-card-foreground mb-4 leading-tight">
          {service.title}
        </h3>
        
        <p className="text-muted-foreground text-base leading-relaxed mb-6 flex-grow">
          {service.description}
        </p>
        
        <Button 
          variant="outline" 
          className="w-full font-medium py-3 rounded-md mt-auto"
          asChild
        >
          <a href={service.href} className="flex items-center justify-center">
            Learn more
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}