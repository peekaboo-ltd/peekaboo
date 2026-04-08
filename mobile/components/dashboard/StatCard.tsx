import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors, typography, spacing } from '../../utils/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = colors.primary,
  subtitle,
  trend,
  onPress,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const cardStyle = isCompact ? { ...styles.card, ...styles.cardCompact } : styles.card;

  return (
    <Card style={cardStyle} elevation="lg" onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, isCompact && styles.iconContainerCompact, { backgroundColor: `${iconColor}12` }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        {trend && (
          <View style={[styles.trend, trend.isPositive ? styles.trendPositive : styles.trendNegative]}>
            <Ionicons
              name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={trend.isPositive ? colors.success : colors.danger}
            />
            <Text style={[styles.trendText, { color: trend.isPositive ? colors.success : colors.danger }]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, isCompact && styles.valueCompact]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs, // Add horizontal spacing between cards
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.18)',
  },
  cardCompact: {
    minWidth: '48%',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerCompact: {
    width: 36,
    height: 36,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  trendNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  valueCompact: {
    fontSize: 22,
  },
  title: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
    marginTop: 2,
  },
});
