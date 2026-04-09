import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { typography, spacing, borderRadius, type AppColors } from '../../utils/constants';
import { useTheme } from '../../contexts/theme-context';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'neutral',
  size = 'medium',
  style,
  textStyle,
}) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'success':
        return '#D1FAE5'; // green-100
      case 'warning':
        return isDark ? 'rgba(252, 191, 73, 0.24)' : 'rgba(252, 191, 73, 0.2)';
      case 'danger':
        return '#FEE2E2'; // red-100
      case 'info':
        return '#DBEAFE'; // blue-100
      default:
        return colors.surface;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'success':
        return '#059669'; // green-600
      case 'warning':
        return isDark ? '#FCD77F' : '#8A6200';
      case 'danger':
        return '#DC2626'; // red-600
      case 'info':
        return '#2563EB'; // blue-600
      default:
        return colors.text.secondary;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: spacing.sm,
        };
      default:
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm + 2,
        };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 10 };
      default:
        return { fontSize: typography.caption.fontSize };
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        getSizeStyle(),
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: getTextColor() },
          getTextSizeStyle(),
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
