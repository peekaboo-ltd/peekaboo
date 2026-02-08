export const ENVIRONMENTS = {
  API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  inactivityTimeout: import.meta.env.VITE_INACTIVITY_TIMEOUT || '5', // in minutes
};
