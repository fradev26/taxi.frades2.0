import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, MapPin, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

interface EmptyStateProps {
  type: "trips" | "wallet" | "general";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionLabel = "Boek een rit", 
  onAction 
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(ROUTES.HOME);
    }
  };

  const getIllustration = () => {
    switch (type) {
      case "trips":
        return (
          <div className="relative w-48 h-32 mx-auto mb-6">
            {/* City skyline */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/40 to-transparent rounded-lg">
              <div className="absolute bottom-0 left-4 w-6 h-12 bg-muted rounded-t-sm"></div>
              <div className="absolute bottom-0 left-12 w-4 h-8 bg-muted/80 rounded-t-sm"></div>
              <div className="absolute bottom-0 left-18 w-8 h-16 bg-muted rounded-t-sm"></div>
              <div className="absolute bottom-0 right-12 w-5 h-10 bg-muted/80 rounded-t-sm"></div>
              <div className="absolute bottom-0 right-4 w-7 h-14 bg-muted rounded-t-sm"></div>
            </div>
            
            {/* Taxi */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            
            {/* People waiting */}
            <div className="absolute bottom-12 left-8">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            
            {/* Location pin */}
            <div className="absolute top-4 right-8">
              <MapPin className="w-8 h-8 text-accent-green animate-bounce" />
            </div>
          </div>
        );
      
      case "wallet":
        return (
          <div className="relative w-48 h-32 mx-auto mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-16 bg-gradient-primary rounded-xl shadow-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">€</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative w-48 h-32 mx-auto mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="text-center py-12 px-6">
        {getIllustration()}
        
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        
        <Button 
          variant="taxi-primary" 
          size="lg" 
          onClick={handleAction}
          className="gap-2 px-8"
        >
          <Car className="w-5 h-5" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}