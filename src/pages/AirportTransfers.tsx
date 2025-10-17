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
      description: "We volgen uw vlucht en passen de ophaaltijd automatisch aan bij vertragingen."
    },
    {
      icon: Clock,
      title: "Extra wachttijd",
      description: "Gratis wachttijd inbegrepen voor bagage ophalen en douane."
    },
    {
      icon: Luggage,
      title: "Bagageservice",
      description: "Hulp bij het laden en lossen van uw bagage."
    },
    {
      icon: Shield,
      title: "Cruise & Port transfers",
      description: "Direct vervoer van en naar cruise terminals en havens, inclusief wachttijd en bagageservice."
    }
  ];

  const airports = [
    {
      name: "Brussels Airport (BRU)",
      location: "Zaventem",
      distance: "12 km van Brussel centrum"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Belangrijkste voordelen als cards */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Airport & Port Transfers
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Stressvrij vervoer van en naar luchthavens én cruise terminals. Altijd inclusief vlucht- of schiptracking, wachttijd en bagageservice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                  <feature.icon className="w-8 h-8 text-black" />
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

      {/* Call to Action Section */}
      <section className="text-center bg-black text-white rounded-lg p-12 mt-16">
        <h2 className="text-3xl font-bold mb-4">Boek direct uw luchthaven transfer</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Reserveer eenvoudig online en geniet van een stressvrije rit van en naar de luchthaven.
        </p>
        <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 font-semibold" asChild>
          <Link to="/">Boek nu</Link>
        </Button>
      </section>
    </div>
  );
}