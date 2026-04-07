import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { RecentActivity as RecentActivityType } from '../../types';
import { colors, typography, spacing } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';
import { useI18n } from '../../i18n';

interface RecentActivityProps {
  activities: RecentActivityType[];
  onActivityPress?: (activity: RecentActivityType) => void;
}

const getActivityIcon = (type: RecentActivityType['type']): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'assignment_accepted':
      return 'checkmark-circle';
    case 'assignment_completed':
      return 'trophy';
    case 'assignment_rejected':
      return 'close-circle';
    case 'order_delivered':
      return 'bicycle';
    default:
      return 'time';
  }
};

const getActivityColor = (type: RecentActivityType['type']): string => {
  switch (type) {
    case 'assignment_accepted':
      return colors.primary;
    case 'assignment_completed':
    case 'order_delivered':
      return colors.success;
    case 'assignment_rejected':
      return colors.danger;
    default:
      return colors.text.secondary;
  }
};

interface ActivityItemProps {
  activity: RecentActivityType;
  onPress?: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPress }) => {
  const icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <Card 
      style={styles.activityCard} 
      onPress={onPress}
      elevation="none"
      variant="outlined"
      padding="sm"
    >
      <View style={styles.activityContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(activity.timestamp)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onActivityPress,
}) => {
  const { t } = useI18n();
  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color={colors.text.disabled} />
        <Text style={styles.emptyText}>{t('activity.empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ActivityItem 
          activity={item} 
          onPress={() => onActivityPress?.(item)} 
        />
      )}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  activityCard: {
    marginBottom: 0,
    backgroundColor: colors.surface,
    borderColor: 'rgba(95, 149, 152, 0.18)',
    borderRadius: 16,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  separator: {
    height: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});
