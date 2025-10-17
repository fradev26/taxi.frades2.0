import { Car, Crown, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StandardVehicleType {
  id: "standard" | "luxury" | "van";
  name: string;
  description: string;
  icon: LucideIcon;
  basePrice: number;
  hourlyRate: number;
  perKmRate: number;
  maxPassengers: number;
  features: string[];
  category: "economy" | "premium" | "group";
}

export const STANDARD_VEHICLES: StandardVehicleType[] = [
  {
    id: "standard",
    name: "Standaard",
    description: "Comfortabele sedan voor 1-4 personen",
    icon: Car,
    basePrice: 35,
    hourlyRate: 25,
    perKmRate: 1.85,
    maxPassengers: 4,
    features: ["Airconditioning", "GPS", "Professionele chauffeur", "Gratis WiFi"],
    category: "economy"
  },
  {
    id: "luxury",
    name: "Luxe",
    description: "Premium voertuig voor speciale gelegenheden",
    icon: Crown,
    basePrice: 60,
    hourlyRate: 45,
    perKmRate: 2.75,
    maxPassengers: 4,
    features: ["Leren interieur", "WiFi", "Verfrissingen", "Premium sound"],
    category: "premium"
  },
  {
    id: "van",
    name: "Van",
    description: "Ruime bestelwagen voor groepen en bagage",
    icon: Users,
    basePrice: 50,
    hourlyRate: 35,
    perKmRate: 2.25,
    maxPassengers: 8,
    features: ["8 zitplaatsen", "Bagageruimte", "Klimaatbeheersing", "USB oplading"],
    category: "group"
  }
];

// Helper functions
export const getVehicleById = (id: string): StandardVehicleType | undefined => {
  return STANDARD_VEHICLES.find(vehicle => vehicle.id === id);
};

export const getVehiclesByCategory = (category: StandardVehicleType["category"]): StandardVehicleType[] => {
  return STANDARD_VEHICLES.filter(vehicle => vehicle.category === category);
};

export const formatPrice = (price: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency
  }).format(price);
};