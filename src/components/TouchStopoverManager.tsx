import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GripVertical, X, MapPin, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stopover } from "@/types";

interface TouchStopoverManagerProps {
  stopovers: Stopover[];
  onStopoverUpdate: (id: string, field: keyof Stopover, value: string | number) => void;
  onStopoverRemove: (id: string) => void;
  onStopoverReorder: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export function TouchStopoverManager({
  stopovers,
  onStopoverUpdate,
  onStopoverRemove,
  onStopoverReorder,
  className
}: TouchStopoverManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleTouchStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const stopoverElement = element?.closest('[data-stopover-index]');
    
    if (stopoverElement) {
      const targetIndex = parseInt(stopoverElement.getAttribute('data-stopover-index') || '0');
      setDragOverIndex(targetIndex);
    }
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onStopoverReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {stopovers.map((stopover, index) => (
        <Card
          key={stopover.id}
          data-stopover-index={index}
          className={cn(
            "transition-all duration-200 touch-manipulation",
            "border-l-4 border-l-amber-500",
            draggedIndex === index && "scale-105 shadow-lg z-10",
            dragOverIndex === index && draggedIndex !== index && "border-primary bg-primary/5"
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              <div
                className="mt-1 cursor-grab active:cursor-grabbing touch-manipulation"
                onTouchStart={() => handleTouchStart(index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onTouchEnd={handleTouchEnd}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Stopover Number */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Address Input */}
                <Input
                  value={stopover.address}
                  onChange={(e) => onStopoverUpdate(stopover.id, 'address', e.target.value)}
                  placeholder={`Tussenstop ${index + 1} adres`}
                  className="text-sm border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />

                {/* Duration Input (Mobile Optimized) */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={stopover.duration || 5}
                      onChange={(e) => onStopoverUpdate(stopover.id, 'duration', parseInt(e.target.value) || 5)}
                      min="1"
                      max="120"
                      className="w-16 h-8 text-xs text-center"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                  
                  {/* Quick Duration Buttons */}
                  <div className="flex gap-1 ml-2">
                    {[5, 10, 15, 30].map((duration) => (
                      <Button
                        key={duration}
                        type="button"
                        variant={stopover.duration === duration ? "default" : "outline"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onStopoverUpdate(stopover.id, 'duration', duration)}
                      >
                        {duration}m
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Coordinates Info */}
                {stopover.coordinates && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Navigation className="w-3 h-3" />
                    <span>
                      {stopover.coordinates.lat.toFixed(4)}, {stopover.coordinates.lng.toFixed(4)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Gelocaliseerd
                    </Badge>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onStopoverRemove(stopover.id)}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {stopovers.length === 0 && (
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Geen tussenstops toegevoegd
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tik op "Tussenstop toevoegen" om te beginnen
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reorder Instructions */}
      {stopovers.length > 1 && (
        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded border-dashed border">
          <GripVertical className="w-3 h-3 inline mr-1" />
          Sleep de handvatten om de volgorde van tussenstops te wijzigen
        </div>
      )}
    </div>
  );
}