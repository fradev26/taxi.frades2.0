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
      title: "Privéchauffeur",
      description: "Uw eigen privéchauffeur voor de hele duur van de boeking"
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

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Waarom onze privéchauffeur service?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Maximale flexibiliteit en comfort voor al uw vervoersbehoeften met een privéchauffeur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white border border-gray-200">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-black">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-black hover:bg-gray-900 text-white px-8 py-4" asChild>
                <Link to="/private-chauffeur-booking">Boek nu
                  <Users className="ml-2 h-5 w-5 text-white" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8 py-4">
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
            <h2 className="text-3xl font-bold text-black mb-4">
              Waarom onze privéchauffeur service?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Maximale flexibiliteit en comfort voor al uw vervoersbehoeften met een privéchauffeur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white border border-gray-200">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-black">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Packages Section volledig verwijderd */}

        {/* CTA Section */}
        <section className="text-center bg-purple-50 dark:bg-purple-950/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Klaar voor uw privéchauffeur?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Boek uw privéchauffeur en geniet van maximale flexibiliteit en comfort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-black hover:bg-gray-900 text-white px-8 py-4" asChild>
              <Link to="/private-chauffeur-booking">Start boeking</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8 py-4" asChild>
              <Link to="/contact">Offerte aanvragen</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}