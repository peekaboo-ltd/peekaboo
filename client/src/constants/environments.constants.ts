const nodeEnvironment =
  import.meta.env.VITE_NODE_ENVIRONMENT || import.meta.env.MODE || '';

export const ENVIRONMENTS = {
  API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  inactivityTimeout: import.meta.env.VITE_INACTIVITY_TIMEOUT || '5', // in minutes
  /** Optional override; falls back to Vite MODE (development | production). */
  NODE_ENVIRONMENT: nodeEnvironment,
  /**
   * When true, UI shows catalog fees with a disclaimer that checkout charges 10 RWF.
   * Server enforces the charge override via NODE_ENV=development.
   */
  isDevelopmentPricing: nodeEnvironment.toLowerCase() === 'development',
};

/** Fixed checkout amount charged in development (server is source of truth). */
export const DEVELOPMENT_PAYMENT_AMOUNT_RWF = 10;
