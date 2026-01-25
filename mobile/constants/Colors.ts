/**
 * Color constants for the Peekaboo Rider app
 * Using Color Hunt Palette: #061E29 #1D546D #5F9598 #F3F4F4
 * Reference: https://colorhunt.co/palette/061e291d546d5f9598f3f4f4
 */

const tintColorLight = '#1D546D'; // Dark teal
const tintColorDark = '#5F9598'; // Lighter muted teal

export default {
  light: {
    text: '#061E29', // Very dark blue
    textSecondary: '#1D546D', // Dark teal
    background: '#F3F4F4', // Very light gray
    surface: '#FFFFFF', // White
    tint: tintColorLight,
    tabIconDefault: '#5F9598', // Muted teal
    tabIconSelected: tintColorLight,
    border: '#5F9598', // Muted teal
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  dark: {
    text: '#F3F4F4', // Very light gray
    textSecondary: '#5F9598', // Muted teal
    background: '#061E29', // Very dark blue
    surface: '#1D546D', // Dark teal
    tint: tintColorDark,
    tabIconDefault: '#5F9598', // Muted teal
    tabIconSelected: tintColorDark,
    border: '#1D546D', // Dark teal
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
};
