import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Loader2, Clock, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface StopoverLoadingStateProps {
  className?: string;
}

function StopoverLoadingState({ className }: StopoverLoadingStateProps) {
  return (
    <Card className={cn("border-dashed border-muted-foreground/20 bg-muted/10", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-2 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RouteCalculatingStateProps {
  className?: string;
}

function RouteCalculatingState({ className }: RouteCalculatingStateProps) {
  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-3 text-primary">
          <Route className="w-5 h-5 animate-pulse" />
          <div className="space-y-1">
            <p className="font-medium">Route wordt berekend...</p>
            <p className="text-sm text-muted-foreground">Inclusief verkeersinformatie</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 bg-primary/20 rounded animate-pulse"></div>
          <div className="h-2 bg-primary/20 rounded animate-pulse w-2/3"></div>
        </div>
      </CardContent>
    </Card>
  );
}

interface VehicleSelectionLoadingProps {
  className?: string;
}

function VehicleSelectionLoading({ className }: VehicleSelectionLoadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded animate-pulse w-1/3"></div>
        <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="flex gap-1">
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-5 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface AddStopoverButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  maxReached?: boolean;
  className?: string;
}

function AddStopoverButton({ 
  onClick, 
  disabled = false, 
  loading = false, 
  maxReached = false,
  className 
}: AddStopoverButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading || maxReached}
      className={cn(
        "transition-opacity duration-200 hover:opacity-90",
        "border-dashed border-2 hover:border-primary",
        maxReached && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Toevoegen...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2" />
          {maxReached ? "Maximum bereikt" : "Tussenstop toevoegen"}
        </>
      )}
    </Button>
  );
}

interface MapLoadingOverlayProps {
  className?: string;
}

function MapLoadingOverlay({ className }: MapLoadingOverlayProps) {
  return (
    <div className={cn(
      "absolute inset-0 bg-background/80 backdrop-blur-sm",
      "flex items-center justify-center z-10 rounded-lg",
      className
    )}>
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Kaart wordt geladen...</p>
          <p className="text-sm text-muted-foreground">Route wordt berekend</p>
        </div>
      </div>
    </div>
  );
}

export { StopoverLoadingState, RouteCalculatingState, VehicleSelectionLoading, AddStopoverButton, MapLoadingOverlay };