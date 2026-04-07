// API Configuration
const apiBaseUrlFromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!apiBaseUrlFromEnv) {
  if (__DEV__) {
    console.warn('EXPO_PUBLIC_API_BASE_URL is missing; using localhost fallback for development.');
  } else {
    console.error('EXPO_PUBLIC_API_BASE_URL is missing in this build. Check EAS env/secrets.');
  }
}

export const API_BASE_URL = apiBaseUrlFromEnv || (__DEV__ ? 'http://localhost:3000/api' : '');
export const API_TIMEOUT = 30000;


const locationUpdateIntervalMinutesFromEnv = Number(
  process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL_MINUTES || '5'
);
const locationUpdateIntervalMinutes =
  Number.isFinite(locationUpdateIntervalMinutesFromEnv) &&
  locationUpdateIntervalMinutesFromEnv > 0
    ? locationUpdateIntervalMinutesFromEnv
    : 1; // Default to 0.5 minutes (30 seconds) if env variable is invalid

export const LOCATION_UPDATE_INTERVAL_MS =
  locationUpdateIntervalMinutes * 60 * 1000;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
} as const;

// Colors - Color Hunt Palette: #061E29 #1D546D #5F9598 #F3F4F4
// Reference: https://colorhunt.co/palette/061e291d546d5f9598f3f4f4
export const colors = {
  primary: '#1D546D', // Dark teal - main brand color
  primaryLight: '#5F9598', // Lighter muted teal
  primaryDark: '#061E29', // Very dark blue
  success: '#10B981', // Keep for success states
  successLight: '#34D399',
  warning: '#F59E0B', // Keep for warning states
  warningLight: '#FBBF24',
  danger: '#EF4444', // Keep for error states
  dangerLight: '#F87171',
  background: '#F3F4F4', // Very light gray
  surface: '#FFFFFF', // White for cards/surfaces
  surfaceHover: '#E5E7EB', // Slightly darker for hover states
  text: {
    primary: '#061E29', // Very dark blue for main text
    secondary: '#1D546D', // Dark teal for secondary text
    disabled: '#5F9598', // Muted teal for disabled text
    inverse: '#FFFFFF', // White for text on dark backgrounds
  },
  border: '#5F9598', // Muted teal for borders (can use with opacity)
  borderDark: '#1D546D', // Darker teal for stronger borders
} as const;

// Typography
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
} as const;

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadow
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
