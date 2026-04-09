import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { spacing, borderRadius, shadows, type AppColors } from '../../utils/constants';
import { useTheme } from '../../contexts/theme-context';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevation = 'sm',
  padding = 'md',
  variant = 'default',
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const getElevationStyle = (): ViewStyle => {
    if (variant === 'outlined' || elevation === 'none') return {} as ViewStyle;
    return (shadows[elevation] || shadows.sm) as ViewStyle;
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: spacing.sm };
      case 'lg':
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: colors.border,
      };
    }
    return {};
  };

  const cardStyle = [
    styles.card,
    getElevationStyle(),
    getPaddingStyle(),
    getVariantStyle(),
    style,
  ].filter(Boolean);

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
});
