import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrips } from "@/hooks/useTrips";
import { 
  Plus, 
  Navigation, 
  Clock, 
  MapPin, 
  Car,
  Calendar,
  Repeat,
  Star,
  Settings
} from "lucide-react";

interface QuickActionsProps {
  className?: string;
  onBookNewTrip?: () => void;
  onViewActiveTrips?: () => void;
  onScheduleTrip?: () => void;
  onViewHistory?: () => void;
}

export function QuickActions({ 
  className, 
  onBookNewTrip,
  onViewActiveTrips,
  onScheduleTrip,
  onViewHistory
}: QuickActionsProps) {
  const { activeTrips, upcomingTrips } = useTrips();

  const quickActions = [
    {
      id: 'book-now',
      title: 'Boek Nu',
      description: 'Direct een rit boeken',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      onClick: onBookNewTrip
    },
    {
      id: 'schedule',
      title: 'Plannen',
      description: 'Rit voor later plannen',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      onClick: onScheduleTrip
    },
    {
      id: 'active',
      title: 'Actieve Ritten',
      description: `${activeTrips.length} actief`,
      icon: Navigation,
      color: 'bg-orange-100 hover:bg-orange-200',
      textColor: 'text-orange-800',
      badge: activeTrips.length > 0 ? activeTrips.length : undefined,
      onClick: onViewActiveTrips,
      disabled: activeTrips.length === 0
    },
    {
      id: 'upcoming',
      title: 'Geplande Ritten',
      description: `${upcomingTrips.length} gepland`,
      icon: Clock,
      color: 'bg-purple-100 hover:bg-purple-200',
      textColor: 'text-purple-800',
      badge: upcomingTrips.length > 0 ? upcomingTrips.length : undefined,
      disabled: upcomingTrips.length === 0
    },
    {
      id: 'repeat',
      title: 'Herhaal Rit',
      description: 'Boek eerdere rit opnieuw',
      icon: Repeat,
      color: 'bg-gray-100 hover:bg-gray-200',
      textColor: 'text-gray-800'
    },
    {
      id: 'history',
      title: 'Geschiedenis',
      description: 'Bekijk alle ritten',
      icon: Star,
      color: 'bg-yellow-100 hover:bg-yellow-200',
      textColor: 'text-yellow-800',
      onClick: onViewHistory
    }
  ];

  const favoriteRoutes = [
    { from: 'Thuis', to: 'Kantoor', count: 12 },
    { from: 'Schiphol', to: 'Amsterdam CS', count: 8 },
    { from: 'Station', to: 'Centrum', count: 5 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Snelle Acties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className={`h-auto p-4 flex flex-col items-center gap-2 relative ${action.color} ${action.textColor} ${
                      action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    <div className="relative">
                      <Icon className="w-6 h-6" />
                      {action.badge && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs opacity-70">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Routes */}
      {favoriteRoutes.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Favoriete Routes</h3>
              <div className="space-y-3">
                {favoriteRoutes.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{route.from} → {route.to}</p>
                        <p className="text-xs text-muted-foreground">{route.count} keer gereden</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Car className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recente Activiteit</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Rit voltooid</p>
                  <p className="text-xs text-muted-foreground">Schiphol → Amsterdam CS</p>
                </div>
                <p className="text-xs text-muted-foreground">2 uur geleden</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Rit gepland</p>
                  <p className="text-xs text-muted-foreground">Morgen 09:30</p>
                </div>
                <p className="text-xs text-muted-foreground">Gisteren</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}