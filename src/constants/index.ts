// Application constants
export const APP_CONFIG = {
  name: 'FRADES',
  description: 'Premium chauffeur service',
  version: '1.0.0',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  WALLET: '/wallet',
  TRIPS: '/trips',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  PRIVACY_POLICY: '/privacy-policy',
  COOKIE_POLICY: '/cookie-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  SALES_TERMS: '/sales-terms',
  LEGAL_INFO: '/legal-info',
  SITE_MAP: '/site-map',
} as const;

export const TRIP_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = [
  { value: 'direct', label: 'Direct Payment' },
  { value: 'credit', label: 'Credit' },
  { value: 'invoice', label: 'Invoice' },
] as const;

export const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  VAN: 'van',
  LUXURY: 'luxury',
} as const;

export const TRANSACTION_TYPES = {
  RIDE: 'ride',
  CREDIT: 'credit',
  REFUND: 'refund',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: '/auth/signup',
    SIGN_IN: '/auth/signin',
    SIGN_OUT: '/auth/signout',
    REFRESH: '/auth/refresh',
  },
  TRIPS: {
    LIST: '/trips',
    CREATE: '/trips',
    UPDATE: '/trips',
    DELETE: '/trips',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
  PAYMENTS: {
    METHODS: '/payments/methods',
    TRANSACTIONS: '/payments/transactions',
  },
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
} as const;