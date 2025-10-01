import { VALIDATION_RULES } from '@/constants';
import type { BookingFormData } from '@/types';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

export const validateBookingForm = (data: BookingFormData, isGuestBooking: boolean = false): string[] => {
  const errors: string[] = [];

  if (!data.pickup.trim()) {
    errors.push('Vertrekpunt is verplicht');
  }

  if (!data.destination.trim()) {
    errors.push('Bestemming is verplicht');
  }

  if (!data.date) {
    errors.push('Datum is verplicht');
  }

  if (!data.time) {
    errors.push('Tijd is verplicht');
  }

  if (!data.paymentMethod) {
    errors.push('Betaalmethode is verplicht');
  }

  // Validate guest booking fields if needed
  if (isGuestBooking && data.paymentMethod === 'direct') {
    if (!data.guestName?.trim()) {
      errors.push('Naam is verplicht voor gastboeking');
    }

    if (!data.guestEmail?.trim()) {
      errors.push('E-mailadres is verplicht voor gastboeking');
    } else if (!validateEmail(data.guestEmail)) {
      errors.push('Ongeldig e-mailadres');
    }

    if (!data.guestPhone?.trim()) {
      errors.push('Telefoonnummer is verplicht voor gastboeking');
    } else if (!validatePhone(data.guestPhone)) {
      errors.push('Ongeldig telefoonnummer');
    }
  }

  // Validate date is not in the past
  if (data.date && data.time) {
    const selectedDateTime = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    if (selectedDateTime < now) {
      errors.push('Datum en tijd kunnen niet in het verleden liggen');
    }
  }

  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};