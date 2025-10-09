import { useReducer, useCallback } from 'react';
import type { BookingFormData, Stopover } from '@/types';

// Define all possible state for BookingForm
interface BookingFormState {
  // Form data
  formData: BookingFormData;
  
  // UI state
  ui: {
    showStopover: boolean;
    isSubmitting: boolean;
    showMap: boolean;
    isGuestBooking: boolean;
    showPickupSuggestions: boolean;
    showDestinationSuggestions: boolean;
  };
  
  // Google Maps state
  maps: {
    isLoaded: boolean;
    map: google.maps.Map | null;
    pickupMarker: google.maps.Marker | null;
    destinationMarker: google.maps.Marker | null;
    stopoverMarker: google.maps.Marker | null;
    stopoverMarkers: google.maps.Marker[];
    directionsRenderer: google.maps.DirectionsRenderer | null;
  };
  
  // Address suggestions state
  suggestions: {
    pickup: any[];
    destination: any[];
  };
  
  // Pricing state
  pricing: {
    breakdown: any | null;
    isCalculating: boolean;
    error: string | null;
    distanceResult: any | null;
  };
  
  // Vehicle state
  vehicles: {
    list: any[];
    isLoading: boolean;
  };
}

// Action types
type BookingFormAction =
  | { type: 'UPDATE_FORM_DATA'; field: keyof BookingFormData; value: any }
  | { type: 'UPDATE_MULTIPLE_FIELDS'; updates: Partial<BookingFormData> }
  | { type: 'RESET_FORM' }
  | { type: 'SET_UI_STATE'; field: keyof BookingFormState['ui']; value: boolean }
  | { type: 'SET_MAPS_STATE'; field: keyof BookingFormState['maps']; value: any }
  | { type: 'SET_SUGGESTIONS'; field: keyof BookingFormState['suggestions']; value: any[] }
  | { type: 'SET_PRICING_STATE'; field: keyof BookingFormState['pricing']; value: any }
  | { type: 'SET_VEHICLES_STATE'; field: keyof BookingFormState['vehicles']; value: any }
  | { type: 'ADD_STOPOVER'; stopover: Stopover }
  | { type: 'REMOVE_STOPOVER'; id: string }
  | { type: 'UPDATE_STOPOVER'; id: string; updates: Partial<Stopover> }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'START_PRICE_CALCULATION' }
  | { type: 'SET_PRICE_RESULT'; breakdown: any; distanceResult: any }
  | { type: 'SET_PRICE_ERROR'; error: string };

// Initial state
const initialFormData: BookingFormData = {
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
};

const initialState: BookingFormState = {
  formData: initialFormData,
  ui: {
    showStopover: false,
    isSubmitting: false,
    showMap: true,
    isGuestBooking: false,
    showPickupSuggestions: false,
    showDestinationSuggestions: false,
  },
  maps: {
    isLoaded: false,
    map: null,
    pickupMarker: null,
    destinationMarker: null,
    stopoverMarker: null,
    stopoverMarkers: [],
    directionsRenderer: null,
  },
  suggestions: {
    pickup: [],
    destination: [],
  },
  pricing: {
    breakdown: null,
    isCalculating: false,
    error: null,
    distanceResult: null,
  },
  vehicles: {
    list: [],
    isLoading: true,
  },
};

// Reducer function
function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };

    case 'UPDATE_MULTIPLE_FIELDS':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.updates,
        },
      };

    case 'RESET_FORM':
      return {
        ...state,
        formData: initialFormData,
        ui: {
          ...state.ui,
          isSubmitting: false,
          isGuestBooking: false,
        },
        pricing: {
          breakdown: null,
          isCalculating: false,
          error: null,
          distanceResult: null,
        },
      };

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.field]: action.value,
        },
      };

    case 'SET_MAPS_STATE':
      return {
        ...state,
        maps: {
          ...state.maps,
          [action.field]: action.value,
        },
      };

    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [action.field]: action.value,
        },
      };

    case 'SET_PRICING_STATE':
      return {
        ...state,
        pricing: {
          ...state.pricing,
          [action.field]: action.value,
        },
      };

    case 'SET_VEHICLES_STATE':
      return {
        ...state,
        vehicles: {
          ...state.vehicles,
          [action.field]: action.value,
        },
      };

    case 'ADD_STOPOVER':
      return {
        ...state,
        formData: {
          ...state.formData,
          stopovers: [...state.formData.stopovers, action.stopover],
        },
      };

    case 'REMOVE_STOPOVER':
      return {
        ...state,
        formData: {
          ...state.formData,
          stopovers: state.formData.stopovers.filter(s => s.id !== action.id),
        },
      };

    case 'UPDATE_STOPOVER':
      return {
        ...state,
        formData: {
          ...state.formData,
          stopovers: state.formData.stopovers.map(stopover =>
            stopover.id === action.id ? { ...stopover, ...action.updates } : stopover
          ),
        },
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isSubmitting: action.isSubmitting,
        },
      };

    case 'START_PRICE_CALCULATION':
      return {
        ...state,
        pricing: {
          ...state.pricing,
          isCalculating: true,
          error: null,
        },
      };

    case 'SET_PRICE_RESULT':
      return {
        ...state,
        pricing: {
          ...state.pricing,
          breakdown: action.breakdown,
          distanceResult: action.distanceResult,
          isCalculating: false,
          error: null,
        },
      };

    case 'SET_PRICE_ERROR':
      return {
        ...state,
        pricing: {
          ...state.pricing,
          error: action.error,
          isCalculating: false,
        },
      };

    default:
      return state;
  }
}

// Custom hook
export function useBookingFormState(initialData?: Partial<BookingFormData>) {
  const [state, dispatch] = useReducer(bookingFormReducer, {
    ...initialState,
    formData: { ...initialFormData, ...initialData },
  });

  // Memoized action creators
  const actions = {
    updateFormData: useCallback((field: keyof BookingFormData, value: any) => {
      dispatch({ type: 'UPDATE_FORM_DATA', field, value });
    }, []),

    updateMultipleFields: useCallback((updates: Partial<BookingFormData>) => {
      dispatch({ type: 'UPDATE_MULTIPLE_FIELDS', updates });
    }, []),

    resetForm: useCallback(() => {
      dispatch({ type: 'RESET_FORM' });
    }, []),

    setUIState: useCallback((field: keyof BookingFormState['ui'], value: boolean) => {
      dispatch({ type: 'SET_UI_STATE', field, value });
    }, []),

    setMapsState: useCallback((field: keyof BookingFormState['maps'], value: any) => {
      dispatch({ type: 'SET_MAPS_STATE', field, value });
    }, []),

    setSuggestions: useCallback((field: keyof BookingFormState['suggestions'], value: any[]) => {
      dispatch({ type: 'SET_SUGGESTIONS', field, value });
    }, []),

    setPricingState: useCallback((field: keyof BookingFormState['pricing'], value: any) => {
      dispatch({ type: 'SET_PRICING_STATE', field, value });
    }, []),

    setVehiclesState: useCallback((field: keyof BookingFormState['vehicles'], value: any) => {
      dispatch({ type: 'SET_VEHICLES_STATE', field, value });
    }, []),

    addStopover: useCallback(() => {
      const newStopover: Stopover = {
        id: `stopover-${Date.now()}`,
        address: "",
        coordinates: undefined,
        duration: undefined
      };
      dispatch({ type: 'ADD_STOPOVER', stopover: newStopover });
    }, []),

    removeStopover: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_STOPOVER', id });
    }, []),

    updateStopover: useCallback((id: string, updates: Partial<Stopover>) => {
      dispatch({ type: 'UPDATE_STOPOVER', id, updates });
    }, []),

    setSubmitting: useCallback((isSubmitting: boolean) => {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting });
    }, []),

    startPriceCalculation: useCallback(() => {
      dispatch({ type: 'START_PRICE_CALCULATION' });
    }, []),

    setPriceResult: useCallback((breakdown: any, distanceResult: any) => {
      dispatch({ type: 'SET_PRICE_RESULT', breakdown, distanceResult });
    }, []),

    setPriceError: useCallback((error: string) => {
      dispatch({ type: 'SET_PRICE_ERROR', error });
    }, []),
  };

  return {
    state,
    actions,
    // Convenience getters
    formData: state.formData,
    ui: state.ui,
    maps: state.maps,
    suggestions: state.suggestions,
    pricing: state.pricing,
    vehicles: state.vehicles,
  };
}