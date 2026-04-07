import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Assignment, OrderAssignmentStatus, OrderStatus } from '../../types';
import { colors, typography, spacing } from '../../utils/constants';
import { formatSmartDate, formatCurrency, formatOrderRef } from '../../utils/formatters';
import { getOrderStatusLabel } from '../../constants/order.constants';
import { useI18n } from '../../i18n';

interface AssignmentCardProps {
  assignment: Assignment;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const getStatusBadgeVariant = (status: OrderAssignmentStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  switch (status) {
    case OrderAssignmentStatus.PENDING:
      return 'warning';
    case OrderAssignmentStatus.ACTIVE:
      return 'info';
    case OrderAssignmentStatus.COMPLETED:
      return 'success';
    case OrderAssignmentStatus.REJECTED:
    case OrderAssignmentStatus.CANCELLED:
      return 'danger';
    default:
      return 'neutral';
  }
};

const getStatusLabel = (status: OrderAssignmentStatus, t: ReturnType<typeof useI18n>['t']): string => {
  switch (status) {
    case OrderAssignmentStatus.PENDING:
      return t('assignment.pending');
    case OrderAssignmentStatus.ACTIVE:
      return t('assignment.active');
    case OrderAssignmentStatus.COMPLETED:
      return t('assignment.completed');
    case OrderAssignmentStatus.REJECTED:
      return t('assignment.rejected');
    case OrderAssignmentStatus.CANCELLED:
      return t('assignment.cancelled');
    default:
      return status;
  }
};

const getLatestOrderStatus = (assignment: Assignment): OrderStatus | undefined => {
  const activities = assignment.order?.activities || [];
  if (activities.length === 0) return assignment.order?.status;
  const sorted = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return sorted[0]?.status ?? assignment.order?.status;
};

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onPress,
  onAccept,
  onReject,
  isLoading = false,
}) => {
  const { t } = useI18n();
  const isPending = assignment.status === OrderAssignmentStatus.PENDING;
  const order = assignment.order;
  const latestOrderStatus = getLatestOrderStatus(assignment);

  return (
    <Card style={styles.card} onPress={onPress} elevation="md">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.orderLabel}>{t('assignment.order')}</Text>
            <Text style={styles.orderId}>
              {order?.referenceId ? formatOrderRef(order.referenceId) : `#${assignment.id.slice(0, 8)}`}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge
              text={getStatusLabel(assignment.status, t)}
              variant={getStatusBadgeVariant(assignment.status)}
              size="small"
            />
            {latestOrderStatus != null && (
              <Text style={styles.orderStatusSubtitle}>
                {getOrderStatusLabel(latestOrderStatus)}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.time}>{formatSmartDate(assignment.createdAt)}</Text>
      </View>

      {/* Order Details */}
      {order && (
        <View style={styles.details}>
          {/* Locations */}
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
              <Text style={styles.locationText} numberOfLines={1}>
                {t('assignment.pickupLocation')}
              </Text>
            </View>
            <View style={styles.locationLine} />
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.locationText} numberOfLines={1}>
                {t('assignment.deliveryLocation')}
              </Text>
            </View>
          </View>

          {/* Fee */}
          {order.finalFee && (
            <View style={styles.feeContainer}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
              <Text style={styles.feeText}>{formatCurrency(order.finalFee)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Description */}
      {assignment.description && (
        <Text style={styles.description} numberOfLines={2}>
          {assignment.description}
        </Text>
      )}

      {/* Actions for pending assignments */}
      {isPending && (onAccept || onReject) && (
        <View style={styles.actions}>
          {onReject && (
            <Button
              title={t('assignment.reject')}
              onPress={onReject}
              variant="outline"
              size="small"
              disabled={isLoading}
              style={styles.actionButton}
            />
          )}
          {onAccept && (
            <Button
              title={t('assignment.accept')}
              onPress={onAccept}
              variant="primary"
              size="small"
              loading={isLoading}
              style={StyleSheet.flatten([styles.actionButton, styles.acceptButton])}
            />
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.18)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  orderStatusSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  orderLabel: {
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: colors.text.disabled,
    marginBottom: 2,
  },
  orderId: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
  },
  time: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  details: {
    marginBottom: spacing.sm,
  },
  locationContainer: {
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.primary,
  },
  locationLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(95, 149, 152, 0.35)',
    marginLeft: 3.5,
    marginVertical: 2,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  feeText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.success,
  },
  description: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(95, 149, 152, 0.2)',
  },
  actionButton: {
    minWidth: 80,
  },
  acceptButton: {
    minWidth: 100,
  },
});
