/**
 * Color constants for the Peekaboo Rider app
 * Using a minimalistic design system
 */

const tintColorLight = '#2563EB';
const tintColorDark = '#3B82F6';

export default {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    tint: tintColorLight,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    tint: tintColorDark,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorDark,
    border: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
};
