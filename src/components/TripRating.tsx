import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trip } from "@/services/tripService";
import { formatCurrency } from "@/services/walletService";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Car, 
  User, 
  Clock, 
  Route,
  MessageSquare,
  Send,
  CheckCircle
} from "lucide-react";

interface TripRatingProps {
  trip: Trip;
  onSubmitRating?: (rating: TripRating) => void;
  onClose?: () => void;
}

interface TripRating {
  tripId: string;
  overallRating: number;
  driverRating: number;
  vehicleRating: number;
  punctualityRating: number;
  feedback: string;
  wouldRecommend: boolean;
  categories: string[];
}

const ratingCategories = [
  { id: 'cleanliness', label: 'Schoon voertuig', icon: Car },
  { id: 'friendly', label: 'Vriendelijke chauffeur', icon: User },
  { id: 'safe_driving', label: 'Veilig rijden', icon: Route },
  { id: 'on_time', label: 'Op tijd', icon: Clock },
  { id: 'comfortable', label: 'Comfortabel', icon: ThumbsUp },
  { id: 'professional', label: 'Professioneel', icon: User }
];

export function TripRating({ trip, onSubmitRating, onClose }: TripRatingProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [vehicleRating, setVehicleRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { toast } = useToast();

  const StarRating = ({ 
    rating, 
    onChange, 
    size = 'default' 
  }: { 
    rating: number; 
    onChange: (rating: number) => void;
    size?: 'sm' | 'default' | 'lg';
  }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      default: 'w-6 h-6',
      lg: 'w-8 h-8'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast({
        title: "Beoordeling vereist",
        description: "Geef alsjeblieft een algemene beoordeling.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const ratingData: TripRating = {
      tripId: trip.id,
      overallRating,
      driverRating,
      vehicleRating,
      punctualityRating,
      feedback,
      wouldRecommend: wouldRecommend ?? false,
      categories: selectedCategories
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (onSubmitRating) {
        onSubmitRating(ratingData);
      }

      setSubmitted(true);
      
      toast({
        title: "Beoordeling verzonden",
        description: "Bedankt voor je feedback!",
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error) {
      toast({
        title: "Fout bij verzenden",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Bedankt!</h3>
          <p className="text-muted-foreground mb-4">
            Je beoordeling is verzonden en helpt ons onze service te verbeteren.
          </p>
          {onClose && (
            <Button onClick={onClose} className="w-full">
              Sluiten
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Beoordeel je rit
        </CardTitle>
        <p className="text-muted-foreground">
          Help ons onze service te verbeteren door je ervaring te delen
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trip Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">{trip.pickup_address}</p>
            <Badge variant="secondary">{trip.booking_reference}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">naar {trip.destination_address}</p>
          <div className="flex items-center justify-between text-sm">
            <span>{new Date(trip.scheduled_datetime).toLocaleDateString('nl-NL')}</span>
            <span className="font-medium">{formatCurrency(trip.total_price)}</span>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Algemene beoordeling *</Label>
          <div className="flex items-center gap-4">
            <StarRating rating={overallRating} onChange={setOverallRating} size="lg" />
            <span className="text-lg font-medium">
              {overallRating > 0 && (
                overallRating === 5 ? 'Uitstekend!' :
                overallRating === 4 ? 'Goed' :
                overallRating === 3 ? 'Gemiddeld' :
                overallRating === 2 ? 'Onder gemiddeld' :
                'Slecht'
              )}
            </span>
          </div>
        </div>

        <Separator />

        {/* Detailed Ratings */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Gedetailleerde beoordeling</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Chauffeur</Label>
              <StarRating rating={driverRating} onChange={setDriverRating} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Voertuig</Label>
              <StarRating rating={vehicleRating} onChange={setVehicleRating} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Stiptheid</Label>
              <StarRating rating={punctualityRating} onChange={setPunctualityRating} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Wat vond je goed?</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ratingCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategories.includes(category.id);
              
              return (
                <Button
                  key={category.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className="justify-start h-auto p-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Recommendation */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Zou je ons aanbevelen?</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={wouldRecommend === true ? "default" : "outline"}
              onClick={() => setWouldRecommend(true)}
              className="flex-1"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Ja
            </Button>
            <Button
              type="button"
              variant={wouldRecommend === false ? "destructive" : "outline"}
              onClick={() => setWouldRecommend(false)}
              className="flex-1"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Nee
            </Button>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-3">
          <Label htmlFor="feedback" className="text-base font-medium">
            Aanvullende feedback (optioneel)
          </Label>
          <Textarea
            id="feedback"
            placeholder="Vertel ons meer over je ervaring..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Annuleren
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || overallRating === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Verzenden...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Beoordeling verzenden
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}