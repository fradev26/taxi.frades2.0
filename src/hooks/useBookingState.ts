import { useState, useCallback } from 'react';
import type { BookingFormData, Stopover } from '@/types';

interface UseBookingStateOptions {
  initialData?: Partial<BookingFormData>;
  onDataChange?: (data: BookingFormData) => void;
}

export function useBookingState(options: UseBookingStateOptions = {}) {
  const { initialData = {}, onDataChange } = options;

  const [formData, setFormData] = useState<BookingFormData>({
    pickup: "",
    destination: "",
    stopover: "", // Keep for backwards compatibility
    stopovers: [],
    date: "",
    time: "",
    paymentMethod: "",
    vehicleType: "standard",
    pickupLat: undefined,
    pickupLng: undefined,
    destinationLat: undefined,
    destinationLng: undefined,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    ...initialData
  });

  const updateFormData = useCallback((field: keyof BookingFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const updateMultipleFields = useCallback((updates: Partial<BookingFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const resetForm = useCallback(() => {
    const resetData = {
      pickup: "",
      destination: "",
      stopover: "",
      stopovers: [],
      date: "",
      time: "",
      paymentMethod: "",
      vehicleType: "standard",
      pickupLat: undefined,
      pickupLng: undefined,
      destinationLat: undefined,
      destinationLng: undefined,
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      ...initialData
    };
    setFormData(resetData);
    onDataChange?.(resetData);
  }, [initialData, onDataChange]);

  // Stopover management
  const addStopover = useCallback(() => {
    const newStopover: Stopover = {
      id: `stopover-${Date.now()}`,
      address: "",
      coordinates: undefined,
      duration: undefined
    };
    
    setFormData(prev => {
      const newData = {
        ...prev,
        stopovers: [...prev.stopovers, newStopover]
      };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const removeStopover = useCallback((id: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        stopovers: prev.stopovers.filter(s => s.id !== id)
      };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const updateStopover = useCallback((id: string, updates: Partial<Stopover>) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        stopovers: prev.stopovers.map(stopover => 
          stopover.id === id ? { ...stopover, ...updates } : stopover
        )
      };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  return {
    formData,
    updateFormData,
    updateMultipleFields,
    resetForm,
    // Stopover helpers
    addStopover,
    removeStopover,
    updateStopover,
  };
}