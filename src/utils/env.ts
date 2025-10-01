/**
 * Environment Configuration Utility
 * 
 * Safe environment variable access that works 
 * in both browser (Vite) and Node.js contexts
 */

// Check if we're in browser or Node.js environment
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.env;

/**
 * Get environment variable value safely
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    if (isBrowser && import.meta?.env) {
      // Browser context with Vite
      return import.meta.env[key] || defaultValue;
    } else if (isNode) {
      // Node.js context
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Failed to get environment variable ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Environment configuration object
 */
export const ENV = {
  // Supabase
  VITE_SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  VITE_SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  // Google Maps
  VITE_GOOGLE_MAPS_API_KEY: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
  GOOGLE_PLACES_API_KEY: getEnvVar('GOOGLE_PLACES_API_KEY'),
  GOOGLE_DIRECTIONS_API_KEY: getEnvVar('GOOGLE_DIRECTIONS_API_KEY'),

  // Stripe
  VITE_STRIPE_PUBLISHABLE_KEY: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET'),

  // Other APIs
  TWILIO_ACCOUNT_SID: getEnvVar('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: getEnvVar('TWILIO_AUTH_TOKEN'),
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET'),
} as const;

/**
 * Check if all required environment variables are set
 */
export const validateRequiredEnvVars = (requiredVars: string[]): { valid: boolean; missing: string[] } => {
  const missing = requiredVars.filter(varName => !getEnvVar(varName));
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Get current environment info
 */
export const getEnvironmentInfo = () => ({
  isBrowser,
  isNode,
  hasImportMeta: typeof import.meta !== 'undefined',
  hasProcessEnv: typeof process !== 'undefined' && !!process.env,
});