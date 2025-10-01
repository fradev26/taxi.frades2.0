/**
 * API Configuration Management System
 * 
 * Centralized configuration for all external API integrations
 * with validation, environment detection, and fallback handling.
 */

import { ENV } from '@/utils/env';

export interface ApiConfig {
  name: string;
  description: string;
  required: boolean;
  category: 'database' | 'payment' | 'mapping' | 'communication' | 'analytics' | 'storage' | 'monitoring';
  environment: 'client' | 'server' | 'both';
  securityLevel: 'critical' | 'high' | 'medium' | 'low';
  documentation: string;
  testEndpoint?: string;
  validation?: (key: string) => boolean;
}

export interface ServiceConfig {
  enabled: boolean;
  keys: Record<string, string>;
  endpoints: Record<string, string>;
  options: Record<string, any>;
}

// API Key validation patterns
const API_KEY_PATTERNS = {
  SUPABASE_URL: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
  SUPABASE_ANON_KEY: /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
  STRIPE_PUBLISHABLE: /^pk_(test_|live_)[a-zA-Z0-9]{24,}$/,
  STRIPE_SECRET: /^sk_(test_|live_)[a-zA-Z0-9]{24,}$/,
  GOOGLE_MAPS: /^AIza[0-9A-Za-z-_]{35}$/,
  FIREBASE_API_KEY: /^AIza[0-9A-Za-z-_]{35}$/,
  TWILIO_SID: /^AC[a-z0-9]{32}$/,
  SENDGRID: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/,
  MAPBOX: /^pk\.[a-zA-Z0-9_-]{60,}$/,
  SENTRY_DSN: /^https:\/\/[a-f0-9]{32}@[a-f0-9]+\.ingest\.sentry\.io\/[0-9]+$/,
} as const;

// API Configuration Registry
export const API_REGISTRY: Record<string, ApiConfig> = {
  // Database & Authentication
  SUPABASE_URL: {
    name: 'Supabase URL',
    description: 'Supabase project URL for database and authentication',
    required: true,
    category: 'database',
    environment: 'both',
    securityLevel: 'critical',
    documentation: 'https://supabase.com/docs/guides/api#api-url',
    testEndpoint: '/rest/v1/',
    validation: (key) => API_KEY_PATTERNS.SUPABASE_URL.test(key),
  },
  SUPABASE_ANON_KEY: {
    name: 'Supabase Anonymous Key',
    description: 'Public key for client-side Supabase operations',
    required: true,
    category: 'database',
    environment: 'client',
    securityLevel: 'critical',
    documentation: 'https://supabase.com/docs/guides/api#api-keys',
    validation: (key) => API_KEY_PATTERNS.SUPABASE_ANON_KEY.test(key),
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    name: 'Supabase Service Role Key',
    description: 'Admin key for server-side operations with full database access',
    required: true,
    category: 'database',
    environment: 'server',
    securityLevel: 'critical',
    documentation: 'https://supabase.com/docs/guides/api#api-keys',
    validation: (key) => API_KEY_PATTERNS.SUPABASE_ANON_KEY.test(key),
  },

  // Payment Processing
  STRIPE_PUBLISHABLE_KEY: {
    name: 'Stripe Publishable Key',
    description: 'Client-side key for Stripe payment elements',
    required: true,
    category: 'payment',
    environment: 'client',
    securityLevel: 'critical',
    documentation: 'https://stripe.com/docs/keys',
    testEndpoint: 'https://api.stripe.com/v1/',
    validation: (key) => API_KEY_PATTERNS.STRIPE_PUBLISHABLE.test(key),
  },
  STRIPE_SECRET_KEY: {
    name: 'Stripe Secret Key',
    description: 'Server-side key for payment processing',
    required: true,
    category: 'payment',
    environment: 'server',
    securityLevel: 'critical',
    documentation: 'https://stripe.com/docs/keys',
    validation: (key) => API_KEY_PATTERNS.STRIPE_SECRET.test(key),
  },
  MOLLIE_API_KEY: {
    name: 'Mollie API Key',
    description: 'API key for Mollie payment processing (Belgium)',
    required: false,
    category: 'payment',
    environment: 'server',
    securityLevel: 'critical',
    documentation: 'https://docs.mollie.com/overview/authentication',
  },

  // Mapping & Location
  GOOGLE_MAPS_API_KEY: {
    name: 'Google Maps API Key',
    description: 'API key for Google Maps, Places, and Directions',
    required: true,
    category: 'mapping',
    environment: 'client',
    securityLevel: 'high',
    documentation: 'https://developers.google.com/maps/documentation/javascript/get-api-key',
    validation: (key) => API_KEY_PATTERNS.GOOGLE_MAPS.test(key),
  },
  MAPBOX_ACCESS_TOKEN: {
    name: 'Mapbox Access Token',
    description: 'Alternative mapping service access token',
    required: false,
    category: 'mapping',
    environment: 'client',
    securityLevel: 'high',
    documentation: 'https://docs.mapbox.com/api/accounts/tokens/',
    validation: (key) => API_KEY_PATTERNS.MAPBOX.test(key),
  },

  // Communication
  TWILIO_ACCOUNT_SID: {
    name: 'Twilio Account SID',
    description: 'Twilio account identifier for SMS services',
    required: false,
    category: 'communication',
    environment: 'server',
    securityLevel: 'high',
    documentation: 'https://www.twilio.com/docs/iam/api-keys',
    validation: (key) => API_KEY_PATTERNS.TWILIO_SID.test(key),
  },
  SENDGRID_API_KEY: {
    name: 'SendGrid API Key',
    description: 'API key for email delivery service',
    required: false,
    category: 'communication',
    environment: 'server',
    securityLevel: 'high',
    documentation: 'https://docs.sendgrid.com/ui/account-and-settings/api-keys',
    validation: (key) => API_KEY_PATTERNS.SENDGRID.test(key),
  },

  // Push Notifications
  FIREBASE_API_KEY: {
    name: 'Firebase API Key',
    description: 'Firebase configuration for push notifications',
    required: false,
    category: 'communication',
    environment: 'client',
    securityLevel: 'high',
    documentation: 'https://firebase.google.com/docs/web/setup',
    validation: (key) => API_KEY_PATTERNS.FIREBASE_API_KEY.test(key),
  },

  // Analytics & Monitoring
  GA_MEASUREMENT_ID: {
    name: 'Google Analytics Measurement ID',
    description: 'Google Analytics 4 measurement identifier',
    required: false,
    category: 'analytics',
    environment: 'client',
    securityLevel: 'medium',
    documentation: 'https://developers.google.com/analytics/devguides/collection/ga4',
  },
  SENTRY_DSN: {
    name: 'Sentry DSN',
    description: 'Sentry error tracking data source name',
    required: false,
    category: 'monitoring',
    environment: 'client',
    securityLevel: 'medium',
    documentation: 'https://docs.sentry.io/platforms/javascript/',
    validation: (key) => API_KEY_PATTERNS.SENTRY_DSN.test(key),
  },

  // Storage
  AWS_ACCESS_KEY_ID: {
    name: 'AWS Access Key ID',
    description: 'AWS access key for S3 storage',
    required: false,
    category: 'storage',
    environment: 'server',
    securityLevel: 'high',
    documentation: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  },
  CLOUDINARY_API_KEY: {
    name: 'Cloudinary API Key',
    description: 'Alternative image and file storage service',
    required: false,
    category: 'storage',
    environment: 'both',
    securityLevel: 'high',
    documentation: 'https://cloudinary.com/documentation/how_to_integrate_cloudinary',
  },
} as const;

// Service Configuration Templates
export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  supabase: {
    enabled: true,
    keys: {
      url: ENV.VITE_SUPABASE_URL,
      anonKey: ENV.VITE_SUPABASE_ANON_KEY,
      serviceRoleKey: ENV.SUPABASE_SERVICE_ROLE_KEY,
    },
    endpoints: {
      rest: '/rest/v1',
      auth: '/auth/v1',
      realtime: '/realtime/v1',
    },
    options: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },

  stripe: {
    enabled: !!ENV.VITE_STRIPE_PUBLISHABLE_KEY,
    keys: {
      publishableKey: ENV.VITE_STRIPE_PUBLISHABLE_KEY,
      secretKey: ENV.STRIPE_SECRET_KEY,
      webhookSecret: ENV.STRIPE_WEBHOOK_SECRET,
    },
    endpoints: {
      api: 'https://api.stripe.com/v1',
    },
    options: {
      apiVersion: '2023-10-16',
      typescript: true,
    },
  },

  googleMaps: {
    enabled: !!ENV.VITE_GOOGLE_MAPS_API_KEY,
    keys: {
      apiKey: ENV.VITE_GOOGLE_MAPS_API_KEY,
    },
    endpoints: {
      maps: 'https://maps.googleapis.com/maps/api/js',
      places: 'https://maps.googleapis.com/maps/api/place',
      directions: 'https://maps.googleapis.com/maps/api/directions',
      geocoding: 'https://maps.googleapis.com/maps/api/geocode',
    },
    options: {
      version: 'weekly',
      libraries: ['places', 'geometry'],
      region: 'BE',
      language: 'nl',
    },
  },

  firebase: {
    enabled: !!import.meta.env.VITE_FIREBASE_API_KEY,
    keys: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    },
    endpoints: {},
    options: {
      messagingServiceWorker: '/firebase-messaging-sw.js',
    },
  },

  analytics: {
    enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
    keys: {
      measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
    },
    endpoints: {
      gtag: 'https://www.googletagmanager.com/gtag/js',
    },
    options: {
      trackingOptions: {
        anonymize_ip: true,
        cookie_flags: 'secure;samesite=strict',
      },
    },
  },

  sentry: {
    enabled: !!import.meta.env.VITE_SENTRY_DSN,
    keys: {
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      authToken: import.meta.env.SENTRY_AUTH_TOKEN || '',
    },
    endpoints: {},
    options: {
      environment: import.meta.env.VITE_APP_ENV || 'development',
      tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
    },
  },
};

// Environment Detection
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
} as const;

// Utility Functions
export const validateApiKey = (keyName: string, keyValue: string): boolean => {
  const config = API_REGISTRY[keyName];
  if (!config || !config.validation) return true;
  return config.validation(keyValue);
};

export const getServiceConfig = (serviceName: string): ServiceConfig => {
  return SERVICE_CONFIGS[serviceName] || {
    enabled: false,
    keys: {},
    endpoints: {},
    options: {},
  };
};

export const getRequiredKeys = (): string[] => {
  return Object.entries(API_REGISTRY)
    .filter(([_, config]) => config.required)
    .map(([key]) => key);
};

export const getMissingKeys = (): string[] => {
  return getRequiredKeys().filter(key => {
    const envKey = `VITE_${key}`;
    return !import.meta.env[envKey] && !import.meta.env[key];
  });
};

export const getConfigurationStatus = () => {
  const required = getRequiredKeys();
  const missing = getMissingKeys();
  const configured = required.length - missing.length;
  
  return {
    total: required.length,
    configured,
    missing: missing.length,
    percentage: Math.round((configured / required.length) * 100),
    missingKeys: missing,
  };
};