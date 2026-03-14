import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  return (
    <Card style={styles.card} elevation="lg" onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}12` }]}>
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
      <Text style={styles.value}>{value}</Text>
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
