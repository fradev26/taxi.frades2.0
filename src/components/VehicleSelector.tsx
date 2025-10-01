import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { STANDARD_VEHICLES, formatPrice } from "@/config/vehicles";
import { cn } from "@/lib/utils";

interface VehicleSelectorProps {
  selectedVehicle?: string;
  onVehicleSelect: (vehicleId: string) => void;
  showPricing?: boolean;
  bookingType?: "regular" | "hourly";
  className?: string;
}

export function VehicleSelector({
  selectedVehicle,
  onVehicleSelect,
  showPricing = false,
  bookingType = "regular",
  className = "",
}: VehicleSelectorProps) {
  return (
    <div className={cn("w-full", className)}>
      <h3 
        className="text-base font-medium mb-3 relative z-10"
        style={{ color: 'white' }}
      >
        Voertuig
      </h3>
      
      <div className="flex gap-3 justify-center items-stretch">
        {STANDARD_VEHICLES.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.id;
          
          return (
            <div
              key={vehicle.id}
              className="cursor-pointer rounded-lg text-center flex flex-col justify-center items-center"
              onClick={() => onVehicleSelect(vehicle.id)}
              style={{
                backgroundColor: isSelected ? 'white' : 'black',
                color: isSelected ? 'black' : 'white',
                width: '120px',
                height: '80px',
                padding: '12px',
                flex: '0 0 120px',
                border: '1px solid transparent',
                borderRadius: '8px',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {/* Vehicle Icon */}
              <div className="flex justify-center items-center" style={{ marginBottom: '4px' }}>
                <vehicle.icon 
                  style={{
                    width: '20px',
                    height: '20px',
                    color: isSelected ? 'black' : 'white'
                  }}
                />
              </div>

              {/* Vehicle Info */}
              <div className="flex flex-col items-center">
                <div 
                  style={{
                    color: isSelected ? 'black' : 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: '2px',
                    textAlign: 'center'
                  }}
                >
                  {vehicle.name}
                </div>
                {showPricing && (
                  <div 
                    style={{
                      color: isSelected ? 'black' : 'white',
                      fontSize: '11px',
                      fontWeight: '600',
                      lineHeight: '1.2',
                      textAlign: 'center'
                    }}
                  >
                    {bookingType === "hourly" 
                      ? `${formatPrice(vehicle.hourlyRate)}/u`
                      : `${formatPrice(vehicle.perKmRate)}/km`
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

