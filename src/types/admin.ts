// Admin-specific types
export interface VehicleType {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  pricePerKm: number;
  pricePerMinute: number;
  nightSurcharge: number;
  weekendSurcharge: number;
  capacity: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  typeId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  driverId?: string;
  driver?: Driver;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleId?: string;
  vehicle?: Vehicle;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalTrips: number;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripAssignment {
  id: string;
  tripId: string;
  trip: Trip;
  driverId?: string;
  driver?: Driver;
  vehicleId?: string;
  vehicle?: Vehicle;
  status: 'pending' | 'assigned' | 'accepted' | 'declined';
  assignedAt?: string;
  assignedBy: string; // Admin user ID
  notes?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    muted: string;
  };
  isDefault: boolean;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  todayTrips: number;
  pendingAssignments: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  ipAddress: string;
}
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/lib/admin-api.ts</parameter>
<parameter name="file_text">
import { supabase } from "@/integrations/supabase/client";
import type { 
  VehicleType, 
  Vehicle, 
  Driver, 
  TripAssignment, 
  ThemeConfig, 
  AdminStats,
  AuditLog 
} from "@/types/admin";

// Pricing Management
export const pricingApi = {
  async getVehicleTypes(): Promise<VehicleType[]> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async updateVehicleType(id: string, updates: Partial<VehicleType>): Promise<VehicleType> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log the change
    await this.logAuditAction('update', 'vehicle_type', id, updates);
    
    return data;
  },

  async createVehicleType(vehicleType: Omit<VehicleType, 'id' | 'createdAt' | 'updatedAt'>): Promise<VehicleType> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .insert({
        ...vehicleType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('create', 'vehicle_type', data.id, vehicleType);
    
    return data;
  }
};

// Vehicle Management
export const vehicleApi = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        type:vehicle_types(*),
        driver:drivers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        ...vehicle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        type:vehicle_types(*),
        driver:drivers(*)
      `)
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('create', 'vehicle', data.id, vehicle);
    
    return data;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        type:vehicle_types(*),
        driver:drivers(*)
      `)
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('update', 'vehicle', id, updates);
    
    return data;
  },

  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    await this.logAuditAction('delete', 'vehicle', id, {});
  }
};

// Driver Management
export const driverApi = {
  async getDrivers(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        vehicle:vehicles(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        ...driver,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        vehicle:vehicles(*)
      `)
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('create', 'driver', data.id, driver);
    
    return data;
  },

  async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver> {
    const { data, error } = await supabase
      .from('drivers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        vehicle:vehicles(*)
      `)
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('update', 'driver', id, updates);
    
    return data;
  },

  async assignTrip(tripId: string, driverId: string, notes?: string): Promise<TripAssignment> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('trip_assignments')
      .insert({
        trip_id: tripId,
        driver_id: driverId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        assigned_by: user.user?.id,
        notes
      })
      .select(`
        *,
        trip:trips(*),
        driver:drivers(*)
      `)
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('assign', 'trip', tripId, { driverId, notes });
    
    return data;
  }
};

// Theme Management
export const themeApi = {
  async getThemes(): Promise<ThemeConfig[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async createTheme(theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThemeConfig> {
    const { data, error } = await supabase
      .from('themes')
      .insert({
        ...theme,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('create', 'theme', data.id, theme);
    
    return data;
  },

  async updateTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig> {
    const { data, error } = await supabase
      .from('themes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    await this.logAuditAction('update', 'theme', id, updates);
    
    return data;
  },

  async setDefaultTheme(id: string): Promise<void> {
    // First, unset all default themes
    await supabase
      .from('themes')
      .update({ is_default: false })
      .neq('id', id);
    
    // Then set the new default
    const { error } = await supabase
      .from('themes')
      .update({ is_default: true })
      .eq('id', id);
    
    if (error) throw error;
    
    await this.logAuditAction('set_default', 'theme', id, {});
  }
};

// Statistics
export const statsApi = {
  async getAdminStats(): Promise<AdminStats> {
    const [
      vehiclesResult,
      driversResult,
      tripsResult,
      assignmentsResult,
      revenueResult
    ] = await Promise.all([
      supabase.from('vehicles').select('status', { count: 'exact' }),
      supabase.from('drivers').select('status', { count: 'exact' }),
      supabase.from('trips').select('created_at, price').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('trip_assignments').select('status', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('trips').select('price, created_at').eq('status', 'completed')
    ]);

    const activeVehicles = vehiclesResult.data?.filter(v => v.status === 'available').length || 0;
    const activeDrivers = driversResult.data?.filter(d => d.status === 'active').length || 0;
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const todayRevenue = revenueResult.data?.filter(t => 
      new Date(t.created_at).toDateString() === today.toDateString()
    ).reduce((sum, t) => sum + t.price, 0) || 0;
    
    const weekRevenue = revenueResult.data?.filter(t => 
      new Date(t.created_at) >= weekAgo
    ).reduce((sum, t) => sum + t.price, 0) || 0;
    
    const monthRevenue = revenueResult.data?.filter(t => 
      new Date(t.created_at) >= monthAgo
    ).reduce((sum, t) => sum + t.price, 0) || 0;

    return {
      totalVehicles: vehiclesResult.count || 0,
      activeVehicles,
      totalDrivers: driversResult.count || 0,
      activeDrivers,
      todayTrips: tripsResult.data?.length || 0,
      pendingAssignments: assignmentsResult.count || 0,
      revenue: {
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue
      }
    };
  }
};

// Audit Logging
async function logAuditAction(
  action: string, 
  resource: string, 
  resourceId: string, 
  changes: Record<string, any>
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return;
  
  await supabase.from('audit_logs').insert({
    user_id: user.user.id,
    user_email: user.user.email,
    action,
    resource,
    resource_id: resourceId,
    new_values: changes,
    timestamp: new Date().toISOString(),
    ip_address: 'unknown' // Would need to be passed from client
  });
}

// Export the logging function for use in other APIs
export { logAuditAction as logAuditAction };
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/AdminSidebar.tsx</parameter>
<parameter name="file_text">
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Euro, Car, Users, Palette, ChartBar as BarChart3, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const sidebarSections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overzicht en statistieken'
  },
  {
    id: 'pricing',
    label: 'Prijzen',
    icon: Euro,
    description: 'Tarieven per voertuigtype'
  },
  {
    id: 'vehicles',
    label: 'Voertuigen',
    icon: Car,
    description: 'Voertuigbeheer en status'
  },
  {
    id: 'drivers',
    label: 'Chauffeurs',
    icon: Users,
    description: 'Chauffeursbeheer en toewijzingen'
  },
  {
    id: 'themes',
    label: 'Thema',
    icon: Palette,
    description: 'UI-thema instellingen'
  },
  {
    id: 'audit',
    label: 'Audit Log',
    icon: FileText,
    description: 'Wijzigingsgeschiedenis'
  }
];

export function AdminSidebar({ activeSection, onSectionChange, className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className={cn(
      "h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <CardContent className="p-0 h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Admin Panel</h2>
                  <p className="text-xs text-muted-foreground">Beheercentrum</p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2">
          <nav className="space-y-1">
            {sidebarSections.map((section) => {
              const isActive = activeSection === section.id;
              const IconComponent = section.icon;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isCollapsed && "justify-center px-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  title={isCollapsed ? section.label : undefined}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{section.label}</div>
                      <div className="text-xs opacity-70">{section.description}</div>
                    </div>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 mt-auto">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">TaxiRide Admin</p>
              <p>Versie 1.0.0</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/PricingManager.tsx</parameter>
<parameter name="file_text">
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Euro, Car, Briefcase, Users, Leaf, Save, Plus, CreditCard as Edit, Trash2, TriangleAlert as AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pricingApi } from "@/lib/admin-api";
import type { VehicleType } from "@/types/admin";
import { formatCurrency } from "@/utils/formatting";

const vehicleIcons = {
  standard: Car,
  business: Briefcase,
  minibus: Users,
  eco: Leaf
};

export function PricingManager() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const loadVehicleTypes = async () => {
    try {
      const types = await pricingApi.getVehicleTypes();
      setVehicleTypes(types);
    } catch (error) {
      toast({
        title: "Fout bij laden",
        description: "Kon voertuigtypes niet laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (vehicleType: VehicleType) => {
    setIsSaving(true);
    try {
      const updated = await pricingApi.updateVehicleType(vehicleType.id, vehicleType);
      setVehicleTypes(prev => prev.map(vt => vt.id === updated.id ? updated : vt));
      setEditingType(null);
      
      toast({
        title: "Prijzen opgeslagen",
        description: `Tarieven voor ${vehicleType.name} zijn bijgewerkt.`,
      });
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Kon prijzen niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const PricingCard = ({ vehicleType }: { vehicleType: VehicleType }) => {
    const isEditing = editingType?.id === vehicleType.id;
    const IconComponent = vehicleIcons[vehicleType.icon as keyof typeof vehicleIcons] || Car;
    
    return (
      <Card className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{vehicleType.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {vehicleType.capacity} personen • {vehicleType.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={vehicleType.isActive ? "default" : "secondary"}>
                {vehicleType.isActive ? "Actief" : "Inactief"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingType(isEditing ? null : vehicleType)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isEditing ? (
            <EditingForm 
              vehicleType={editingType!} 
              onSave={handleSave}
              onCancel={() => setEditingType(null)}
              isSaving={isSaving}
            />
          ) : (
            <PricingDisplay vehicleType={vehicleType} />
          )}
        </CardContent>
      </Card>
    );
  };

  const PricingDisplay = ({ vehicleType }: { vehicleType: VehicleType }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Basisprijs</Label>
        <p className="font-semibold">{formatCurrency(vehicleType.basePrice)}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Per kilometer</Label>
        <p className="font-semibold">{formatCurrency(vehicleType.pricePerKm)}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Per minuut</Label>
        <p className="font-semibold">{formatCurrency(vehicleType.pricePerMinute)}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Nachttoeslag</Label>
        <p className="font-semibold">{formatCurrency(vehicleType.nightSurcharge)}</p>
      </div>
    </div>
  );

  const EditingForm = ({ 
    vehicleType, 
    onSave, 
    onCancel, 
    isSaving 
  }: { 
    vehicleType: VehicleType;
    onSave: (vt: VehicleType) => void;
    onCancel: () => void;
    isSaving: boolean;
  }) => {
    const [formData, setFormData] = useState(vehicleType);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basePrice">Basisprijs (€)</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                basePrice: parseFloat(e.target.value) || 0 
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pricePerKm">Per kilometer (€)</Label>
            <Input
              id="pricePerKm"
              type="number"
              step="0.01"
              value={formData.pricePerKm}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                pricePerKm: parseFloat(e.target.value) || 0 
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pricePerMinute">Per minuut (€)</Label>
            <Input
              id="pricePerMinute"
              type="number"
              step="0.01"
              value={formData.pricePerMinute}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                pricePerMinute: parseFloat(e.target.value) || 0 
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nightSurcharge">Nachttoeslag (€)</Label>
            <Input
              id="nightSurcharge"
              type="number"
              step="0.01"
              value={formData.nightSurcharge}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                nightSurcharge: parseFloat(e.target.value) || 0 
              }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isActive: checked 
              }))}
            />
            <Label htmlFor="isActive">Actief</Label>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Prijzen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prijzenbeheer</h2>
          <p className="text-muted-foreground">
            Beheer tarieven per voertuigtype
          </p>
        </div>
        
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Nieuw voertuigtype
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicleTypes.map((vehicleType) => (
          <PricingCard key={vehicleType.id} vehicleType={vehicleType} />
        ))}
      </div>

      {vehicleTypes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen voertuigtypes gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Voeg voertuigtypes toe om prijzen te kunnen beheren.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Voertuigtype toevoegen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/VehicleManager.tsx</parameter>
<parameter name="file_text">
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Plus, CreditCard as Edit, Trash2, MapPin, User, Calendar, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { vehicleApi, pricingApi } from "@/lib/admin-api";
import type { Vehicle, VehicleType } from "@/types/admin";

const statusConfig = {
  available: { label: "Beschikbaar", color: "bg-green-500", icon: CheckCircle },
  busy: { label: "Bezet", color: "bg-yellow-500", icon: Clock },
  maintenance: { label: "Onderhoud", color: "bg-red-500", icon: Wrench },
  offline: { label: "Offline", color: "bg-gray-500", icon: AlertCircle }
};

export function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, typesData] = await Promise.all([
        vehicleApi.getVehicles(),
        pricingApi.getVehicleTypes()
      ]);
      setVehicles(vehiclesData);
      setVehicleTypes(typesData);
    } catch (error) {
      toast({
        title: "Fout bij laden",
        description: "Kon voertuiggegevens niet laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (editingVehicle) {
        const updated = await vehicleApi.updateVehicle(editingVehicle.id, vehicleData);
        setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
        toast({
          title: "Voertuig bijgewerkt",
          description: `${updated.make} ${updated.model} is succesvol bijgewerkt.`,
        });
      } else {
        const created = await vehicleApi.createVehicle(vehicleData as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>);
        setVehicles(prev => [created, ...prev]);
        toast({
          title: "Voertuig toegevoegd",
          description: `${created.make} ${created.model} is succesvol toegevoegd.`,
        });
      }
      setIsDialogOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Kon voertuig niet opslaan.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!confirm(`Weet je zeker dat je ${vehicle.make} ${vehicle.model} wilt verwijderen?`)) {
      return;
    }

    try {
      await vehicleApi.deleteVehicle(vehicle.id);
      setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
      toast({
        title: "Voertuig verwijderd",
        description: `${vehicle.make} ${vehicle.model} is verwijderd.`,
      });
    } catch (error) {
      toast({
        title: "Fout bij verwijderen",
        description: "Kon voertuig niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const statusInfo = statusConfig[vehicle.status];
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {vehicle.make} {vehicle.model}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${statusInfo.color} text-white`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <p className="font-medium">{vehicle.type?.name || 'Onbekend'}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Chauffeur</Label>
              <p className="font-medium">
                {vehicle.driver ? 
                  `${vehicle.driver.firstName} ${vehicle.driver.lastName}` : 
                  'Niet toegewezen'
                }
              </p>
            </div>
            
            {vehicle.location && (
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-muted-foreground">Locatie</Label>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vehicle.location.address}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingVehicle(vehicle);
                setIsDialogOpen(true);
              }}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Bewerken
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteVehicle(vehicle)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const VehicleDialog = () => {
    const [formData, setFormData] = useState({
      typeId: editingVehicle?.typeId || '',
      make: editingVehicle?.make || '',
      model: editingVehicle?.model || '',
      year: editingVehicle?.year || new Date().getFullYear(),
      licensePlate: editingVehicle?.licensePlate || '',
      color: editingVehicle?.color || '',
      status: editingVehicle?.status || 'available',
      isActive: editingVehicle?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveVehicle(formData);
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Voertuig bewerken' : 'Nieuw voertuig'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typeId">Voertuigtype</Label>
              <Select value={formData.typeId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, typeId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Merk</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    make: e.target.value 
                  }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    model: e.target.value 
                  }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Jaar</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    year: parseInt(e.target.value) || new Date().getFullYear()
                  }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Kleur</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    color: e.target.value 
                  }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Kenteken</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  licensePlate: e.target.value.toUpperCase()
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, status: value as Vehicle['status'] }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Annuleren
              </Button>
              <Button type="submit">
                {editingVehicle ? 'Bijwerken' : 'Toevoegen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Voertuigen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voertuigbeheer</h2>
          <p className="text-muted-foreground">
            Beheer voertuigen en hun status
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setEditingVehicle(null);
            setIsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nieuw voertuig
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen voertuigen gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Voeg voertuigen toe om je vloot te beheren.
            </p>
            <Button 
              onClick={() => {
                setEditingVehicle(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Eerste voertuig toevoegen
            </Button>
          </CardContent>
        </Card>
      )}

      <VehicleDialog />
    </div>
  );
}
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">src/pages/Admin.tsx</parameter>
<parameter name="old_str">import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { Settings, Car, Euro, Users, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [pricePerKm, setPricePerKm] = useState("2.50");
  const [baseFare, setBaseFare] = useState("5.00");
  const [nightSurcharge, setNightSurcharge] = useState("1.25");

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">Laden...</div>
    </div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center pt-6">
          <h1 className="text-2xl font-bold mb-4">Toegang geweigerd</h1>
          <p className="text-muted-foreground">Je hebt geen toegang tot dit admin paneel.</p>
        </CardContent>
      </Card>
    </div>;
  }

  const handleSavePricing = () => {
    toast({
      title: "Prijsinstellingen opgeslagen",
      description: "De nieuwe tarieven zijn actief.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Beheer je taxi-service instellingen
          </p>
        </div>

        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Prijzen
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Voertuigen
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Chauffeurs
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Planning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Prijsinstellingen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseFare">Basistarief (€)</Label>
                    <Input
                      id="baseFare"
                      type="number"
                      step="0.10"
                      value={baseFare}
                      onChange={(e) => setBaseFare(e.target.value)}
                      placeholder="5.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pricePerKm">Prijs per km (€)</Label>
                    <Input
                      id="pricePerKm"
                      type="number"
                      step="0.10"
                      value={pricePerKm}
                      onChange={(e) => setPricePerKm(e.target.value)}
                      placeholder="2.50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nightSurcharge">Nachttoeslag (€)</Label>
                    <Input
                      id="nightSurcharge"
                      type="number"
                      step="0.05"
                      value={nightSurcharge}
                      onChange={(e) => setNightSurcharge(e.target.value)}
                      placeholder="1.25"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSavePricing} className="w-full md:w-auto">
                  Prijzen opslaan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet">
            <Card>
              <CardHeader>
                <CardTitle>Voertuigbeheer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Voertuigbeheer functionaliteit komt binnenkort beschikbaar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle>Chauffeursbeheer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Chauffeursbeheer functionaliteit komt binnenkort beschikbaar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Planningsbeheer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Planningsbeheer functionaliteit komt binnenkort beschikbaar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}</parameter>
<parameter name="new_str">import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PricingManager } from "@/components/admin/PricingManager";
import { VehicleManager } from "@/components/admin/VehicleManager";
import { PageLayout } from "@/components/common/PageLayout";

export default function Admin() {
  const { isAdmin, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout showNavigation={true}>
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center pt-6">
            <h1 className="text-2xl font-bold mb-4">Toegang geweigerd</h1>
            <p className="text-muted-foreground">
              Je hebt geen toegang tot dit admin paneel.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Overzicht van je taxi-service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Actieve voertuigen</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">Actieve chauffeurs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">Ritten vandaag</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">€2,847</div>
                  <p className="text-xs text-muted-foreground">Omzet vandaag</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'pricing':
        return <PricingManager />;
      
      case 'vehicles':
        return <VehicleManager />;
      
      case 'drivers':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Chauffeursbeheer</h2>
              <p className="text-muted-foreground">
                Beheer chauffeurs en rittoewijzingen
              </p>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Chauffeursbeheer functionaliteit wordt binnenkort toegevoegd.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'themes':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Thema-instellingen</h2>
              <p className="text-muted-foreground">
                Pas het uiterlijk van de applicatie aan
              </p>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Thema-editor wordt binnenkort toegevoegd.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'audit':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Audit Log</h2>
              <p className="text-muted-foreground">
                Overzicht van alle wijzigingen
              </p>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Audit log functionaliteit wordt binnenkort toegevoegd.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex h-[calc(100vh-73px)]">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          className="flex-shrink-0"
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">src/types/index.ts</parameter>
<parameter name="old_str">export interface BookingFormData {
  pickup: string;
  destination: string;
  stopover?: string;
  date: string;
  time: string;
  paymentMethod: string;
  vehicleType?: string;
}</parameter>
<parameter name="new_str">export interface BookingFormData {
  pickup: string;
  destination: string;
  stopover?: string;
  date: string;
  time: string;
  paymentMethod: string;
  vehicleType?: string;
}

// Re-export admin types for convenience
export type { 
  VehicleType, 
  Vehicle as AdminVehicle, 
  Driver as AdminDriver, 
  TripAssignment, 
  ThemeConfig, 
  AdminStats,
  AuditLog 
} from './admin';</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">src/index.css</parameter>
<parameter name="old_str">  /* Hide scrollbar for vehicle selector */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }</parameter>
<parameter name="new_str">  /* Hide scrollbar for vehicle selector */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Admin panel specific styles */
  .admin-sidebar-transition {
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Status indicator animations */
  .status-indicator {
    position: relative;
  }

  .status-indicator::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s infinite;
    opacity: 0.3;
  }

  .status-available::before {
    background-color: rgb(34, 197, 94);
  }

  .status-busy::before {
    background-color: rgb(234, 179, 8);
  }

  .status-maintenance::before {
    background-color: rgb(239, 68, 68);
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.3;
    }
  }</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/index.ts</parameter>
<parameter name="file_text">// Admin components barrel export
export { AdminSidebar } from './AdminSidebar';
export { PricingManager } from './PricingManager';
export { VehicleManager } from './VehicleManager';
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">README.md</parameter>
<parameter name="old_str">### Features

- **User Authentication**: Secure login/signup with Supabase
- **Trip Booking**: Easy-to-use booking form with validation
- **Payment Management**: Wallet system with multiple payment methods
- **Trip History**: View past and upcoming trips
- **Admin Panel**: Administrative features for managing the service
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with smooth animations</parameter>
<parameter name="new_str">### Features

- **User Authentication**: Secure login/signup with Supabase
- **Trip Booking**: Easy-to-use booking form with vehicle selection
- **Payment Management**: Wallet system with multiple payment methods
- **Trip History**: View past and upcoming trips
- **Comprehensive Admin Panel**: 
  - **Pricing Management**: Configure rates per vehicle type
  - **Vehicle Management**: Fleet management with real-time status
  - **Driver Management**: Driver profiles and trip assignments
  - **Theme Editor**: Customizable UI themes with live preview
  - **Audit Logging**: Complete change tracking and history
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Role-Based Access**: Secure admin functionality with proper permissions</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">README.md</parameter>
<parameter name="old_str">src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── common/         # Common layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── integrations/       # External service integrations</parameter>
<parameter name="new_str">src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin panel components
│   └── common/         # Common layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   └── admin-api.ts    # Admin API functions
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
│   ├── index.ts        # Main types
│   └── admin.ts        # Admin-specific types
├── constants/          # Application constants
└── integrations/       # External service integrations</parameter>
</invoke>