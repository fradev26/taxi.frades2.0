import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { STANDARD_VEHICLES, formatPrice } from "@/config/vehicles";
import { cn } from "@/lib/utils";

interface VehicleSelectorProps {
  selectedVehicle?: string;
  onVehicleSelect: (vehicleId: string) => void;
  showPricing?: boolean;
  bookingType?: "regular" | "hourly";
  className?: string;
}

export const VehicleSelector = React.memo(function VehicleSelector({
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
      
      <div className="flex flex-col gap-3 w-full">
        {STANDARD_VEHICLES.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.id;
          
          return (
            <div
              key={vehicle.id}
              className="cursor-pointer rounded-lg w-full flex items-center p-4"
              onClick={() => onVehicleSelect(vehicle.id)}
              style={{
                backgroundColor: isSelected ? 'white' : 'black',
                color: isSelected ? 'black' : 'white',
                minHeight: '70px',
                border: '1px solid transparent',
                borderRadius: '8px',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {/* Vehicle Icon */}
              <div className="flex justify-center items-center mr-4">
                <vehicle.icon 
                  style={{
                    width: '28px',
                    height: '28px',
                    color: isSelected ? 'black' : 'white'
                  }}
                />
              </div>

              {/* Vehicle Info */}
              <div className="flex flex-col justify-center flex-1">
                <div 
                  style={{
                    color: isSelected ? 'black' : 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: '4px'
                  }}
                >
                  {vehicle.name}
                </div>
                <div 
                  style={{
                    color: isSelected ? 'black' : 'white',
                    fontSize: '13px',
                    fontWeight: '400',
                    lineHeight: '1.2',
                    opacity: 0.8
                  }}
                >
                  {vehicle.description}
                </div>
              </div>

              {/* Pricing Info */}
              {showPricing && (
                <div className="flex items-center justify-end ml-4 min-w-[80px]">
                  <div 
                    style={{
                      color: isSelected ? 'black' : 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.2',
                      textAlign: 'right'
                    }}
                  >
                    {bookingType === "hourly" 
                      ? `${formatPrice(vehicle.hourlyRate)}/u`
                      : `${formatPrice(vehicle.perKmRate)}/km`
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

