import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '../ui/Card';
import { typography, spacing, type AppColors } from '../../utils/constants';
import { useTheme } from '../../contexts/theme-context';

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
  progress?: number;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  subtitle,
  trend,
  progress,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ringColor = iconColor ?? colors.warning;
  const ringSize = 112;
  const ringStroke = 4;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;

  const numericValue = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  const defaultProgress = Number.isFinite(numericValue)
    ? Math.max(0.14, Math.min(1, Math.abs(numericValue) / 100))
    : 0.82;
  const ringProgress = typeof progress === 'number'
    ? Math.max(0.14, Math.min(1, progress))
    : defaultProgress;
  const strokeDasharray = `${ringCircumference * ringProgress} ${ringCircumference}`;

  return (
    <Card style={styles.card} elevation="lg" onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${ringColor}14` }]}>
          <Ionicons name={icon} size={14} color={ringColor} />
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
      <View style={styles.ringWrap}>
        <Svg width={ringSize} height={ringSize}>
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            stroke={`${ringColor}22`}
            strokeWidth={ringStroke}
            fill="none"
          />
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            stroke={ringColor}
            strokeWidth={ringStroke}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            rotation={-90}
            origin={`${ringSize / 2}, ${ringSize / 2}`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.value, { color: ringColor }]}>{value}</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.18)',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  ringWrap: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 34,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
