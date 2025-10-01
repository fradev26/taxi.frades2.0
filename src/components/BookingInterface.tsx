import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookingForm } from "@/components/BookingForm";
import { CompactHourlyBookingForm } from "@/components/CompactHourlyBookingForm";
import { Car, Clock } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface BookingInterfaceProps {
  className?: string;
}

export function BookingInterface({ className = "" }: BookingInterfaceProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL parameter for initial tab
    const tabParam = searchParams.get('tab');
    return tabParam === 'hourly' ? 'hourly' : 'ride';
  });

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without causing page reload
    const newParams = new URLSearchParams(searchParams);
    if (value === 'hourly') {
      newParams.set('tab', 'hourly');
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Listen for navigation changes (e.g., from navigation menu)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'hourly' && activeTab !== 'hourly') {
      setActiveTab('hourly');
    } else if (!tabParam && activeTab !== 'ride') {
      setActiveTab('ride');
    }
  }, [searchParams, activeTab]);

  return (
    <Card className={`w-full max-w-lg mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl ${className}`}>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-lg bg-muted/50 h-12">
            <TabsTrigger 
              value="ride" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
            >
              <Car className="h-4 w-4" />
              <span className="hidden xs:inline">Rit boeken</span>
              <span className="xs:hidden">Rit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="hourly"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden xs:inline">Per uur</span>
              <span className="xs:hidden">Uur</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="max-h-[75vh] overflow-y-auto">
            <TabsContent value="ride" className="mt-0 focus-visible:outline-none">
              <div className="p-6">
                <BookingForm showCancelButton={false} />
              </div>
            </TabsContent>
            
            <TabsContent value="hourly" className="mt-0 focus-visible:outline-none">
              <div className="p-6">
                <CompactHourlyBookingForm />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}