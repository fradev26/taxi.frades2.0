// Admin-specific types

export interface VehicleType {
  id: string;
  name?: string;
  icon?: string;
  basePrice?: number;
  pricePerKm?: number;
  pricePerMinute?: number;
  nightSurcharge?: number;
  weekendSurcharge?: number;
  capacity?: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  vehicleId?: string;
  status?: 'active' | 'inactive' | 'suspended' | string;
  rating?: number;
  totalTrips?: number;
  joinDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  typeId?: string;
  type?: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  driverId?: string;
  driver?: Driver;
  status?: 'available' | 'busy' | 'maintenance' | 'offline' | string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trip {
  id: string;
  userId?: string;
  vehicleId?: string;
  driverId?: string;
  pickupAddress?: string;
  destinationAddress?: string;
  scheduledTime?: string;
  status?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TripAssignment {
  id: string;
  tripId: string;
  trip?: Trip;
  driverId?: string;
  driver?: Driver;
  vehicleId?: string;
  vehicle?: Vehicle;
  status?: 'pending' | 'assigned' | 'accepted' | 'declined' | string;
  assignedAt?: string;
  assignedBy?: string;
  notes?: string;
}

export interface ThemeConfig {
  id: string;
  name?: string;
  displayName?: string;
  colors?: Record<string, string>;
  isDefault?: boolean;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalVehicles?: number;
  activeVehicles?: number;
  totalDrivers?: number;
  activeDrivers?: number;
  todayTrips?: number;
  pendingAssignments?: number;
  revenue?: {
    today?: number;
    thisWeek?: number;
    thisMonth?: number;
  };
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp?: string;
  ipAddress?: string;
}