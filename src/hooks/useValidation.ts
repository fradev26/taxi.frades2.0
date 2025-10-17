import { useState, useCallback, useMemo } from 'react';
import { validateEmail, validatePassword } from '@/utils/validation';
import type { BookingFormData } from '@/types';

interface ValidationRule<T = any> {
  required?: boolean;
  validator?: (value: T) => boolean | string;
  message?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export function useValidation<T extends Record<string, any>>(rules: ValidationRules) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${field} is verplicht`;
    }

    // Custom validator
    if (rule.validator && value) {
      const result = rule.validator(value);
      if (result === false) {
        return rule.message || `${field} is ongeldig`;
      }
      if (typeof result === 'string') {
        return result;
      }
    }

    return null;
  }, [rules]);

  const validateAllFields = useCallback((data: T): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  }, [rules, validateField]);

  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  const validateSingleField = useCallback((field: string, value: any) => {
    const error = validateField(field, value);
    setFieldError(field, error);
    setFieldTouched(field, true);
    return !error;
  }, [validateField, setFieldError, setFieldTouched]);

  const validateForm = useCallback((data: T): boolean => {
    const newErrors = validateAllFields(data);
    setErrors(newErrors);
    
    // Mark all fields as touched
    const touchedFields: Record<string, boolean> = {};
    Object.keys(rules).forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    return Object.keys(newErrors).length === 0;
  }, [validateAllFields, rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldError(field, null);
  }, [setFieldError]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const hasError = useCallback((field: string) => {
    return touched[field] && !!errors[field];
  }, [touched, errors]);

  const getFieldError = useCallback((field: string) => {
    return touched[field] ? errors[field] : undefined;
  }, [touched, errors]);

  return {
    errors,
    touched,
    isValid,
    validateForm,
    validateSingleField,
    setFieldTouched,
    setFieldError,
    clearErrors,
    clearFieldError,
    hasError,
    getFieldError,
  };
}

// Predefined validation rules for common booking form fields
export const bookingValidationRules: ValidationRules = {
  pickup: {
    required: true,
    message: 'Ophaaladres is verplicht'
  },
  destination: {
    required: true,
    message: 'Bestemmingsadres is verplicht'
  },
  date: {
    required: true,
    validator: (value: string) => {
      if (!value) return false;
      const date = new Date(value);
      const now = new Date();
      return date >= now;
    },
    message: 'Geldige datum in de toekomst is verplicht'
  },
  time: {
    required: true,
    message: 'Tijd is verplicht'
  },
  vehicleType: {
    required: true,
    message: 'Voertuigtype is verplicht'
  },
  paymentMethod: {
    required: true,
    message: 'Betaalmethode is verplicht'
  },
  guestName: {
    validator: (value: string) => {
      if (!value) return true; // Optional field
      return value.trim().length >= 2;
    },
    message: 'Naam moet minimaal 2 karakters bevatten'
  },
  guestEmail: {
    validator: (value: string) => {
      if (!value) return true; // Optional field
      return validateEmail(value);
    },
    message: 'Geldig e-mailadres is verplicht'
  },
  guestPhone: {
    validator: (value: string) => {
      if (!value) return true; // Optional field
      return value.trim().length >= 8;
    },
    message: 'Geldig telefoonnummer is verplicht'
  }
};