import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Car, Briefcase, Users, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VehicleOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  capacity: string;
  comfort: string;
  description: string;
  estimatedTime: string;
}

interface VehicleSelectorProps {
  selectedVehicle: string;
  onVehicleChange: (vehicleId: string) => void;
  className?: string;
}

const vehicleOptions: VehicleOption[] = [
  {
    id: "standard",
    name: "Standaard",
    icon: Car,
    price: "€2,50/km",
    capacity: "1-4 personen",
    comfort: "Comfortabel",
    description: "Betrouwbare taxi voor dagelijks gebruik",
    estimatedTime: "3-5 min"
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    price: "€3,50/km",
    capacity: "1-4 personen",
    comfort: "Premium",
    description: "Luxe voertuigen voor zakelijke ritten",
    estimatedTime: "5-8 min"
  },
  {
    id: "minibus",
    name: "Minibus",
    icon: Users,
    price: "€4,00/km",
    capacity: "5-8 personen",
    comfort: "Ruim",
    description: "Ideaal voor groepen en families",
    estimatedTime: "8-12 min"
  },
  {
    id: "eco",
    name: "Eco",
    icon: Leaf,
    price: "€2,20/km",
    capacity: "1-4 personen",
    comfort: "Milieuvriendelijk",
    description: "Elektrische en hybride voertuigen",
    estimatedTime: "4-7 min"
  }
];

export function VehicleSelector({ selectedVehicle, onVehicleChange, className }: VehicleSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Voertuigtype</h3>
        <span className="text-xs text-muted-foreground">
          {vehicleOptions.find(v => v.id === selectedVehicle)?.estimatedTime} wachttijd
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <TooltipProvider>
          {vehicleOptions.map((vehicle) => {
            const isSelected = selectedVehicle === vehicle.id;
            const IconComponent = vehicle.icon;
            
            return (
              <Tooltip key={vehicle.id}>
                <TooltipTrigger asChild>
                  <Card
                    className={cn(
                      "flex-shrink-0 cursor-pointer transition-all duration-200 hover:shadow-md",
                      "border-2 min-w-[100px]",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => onVehicleChange(vehicle.id)}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className={cn(
                        "w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-colors",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className={cn(
                          "text-xs font-medium transition-colors",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {vehicle.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.price}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <span className="font-medium">{vehicle.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Prijs:</span> {vehicle.price}
                      </div>
                      <div>
                        <span className="font-medium">Capaciteit:</span> {vehicle.capacity}
                      </div>
                      <div>
                        <span className="font-medium">Comfort:</span> {vehicle.comfort}
                      </div>
                      <div>
                        <span className="font-medium">Wachttijd:</span> {vehicle.estimatedTime}
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}