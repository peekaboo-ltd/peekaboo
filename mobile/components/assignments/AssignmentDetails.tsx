import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Assignment, OrderAssignmentStatus } from '../../types';
import { colors, typography, spacing } from '../../utils/constants';
import { 
  formatDateTime, 
  formatCurrency, 
  formatOrderRef,
  formatPhoneNumber,
} from '../../utils/formatters';

interface AssignmentDetailsProps {
  assignment: Assignment;
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

const getStatusLabel = (status: OrderAssignmentStatus): string => {
  switch (status) {
    case OrderAssignmentStatus.PENDING:
      return 'Pending';
    case OrderAssignmentStatus.ACTIVE:
      return 'Active';
    case OrderAssignmentStatus.COMPLETED:
      return 'Completed';
    case OrderAssignmentStatus.REJECTED:
      return 'Rejected';
    case OrderAssignmentStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
};

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({
  assignment,
}) => {
  const order = assignment.order;

  const openPhoneDialer = (phoneNumber: string) => {
    const url = Platform.OS === 'ios' ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => {});
  };

  const openMaps = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {/* Order Info */}
      <Card style={styles.section} elevation="sm">
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>
            {order?.referenceId ? formatOrderRef(order.referenceId) : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Badge
            text={getStatusLabel(assignment.status)}
            variant={getStatusBadgeVariant(assignment.status)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created</Text>
          <Text style={styles.value}>{formatDateTime(assignment.createdAt)}</Text>
        </View>
        {assignment.description && (
          <View style={styles.row}>
            <Text style={styles.label}>Notes</Text>
            <Text style={[styles.value, styles.notes]}>{assignment.description}</Text>
          </View>
        )}
      </Card>

      {/* Customer Info */}
      {order?.recipient && (
        <Card style={styles.section} elevation="sm">
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{order.recipient.name || 'N/A'}</Text>
          </View>
          {order.recipient.phoneNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.value}>
                  {formatPhoneNumber(order.recipient.phoneNumber)}
                </Text>
                <Button
                  title=""
                  onPress={() => openPhoneDialer(order.recipient!.phoneNumber)}
                  variant="ghost"
                  size="small"
                  icon={<Ionicons name="call" size={18} color={colors.primary} />}
                  style={styles.callButton}
                />
              </View>
            </View>
          )}
        </Card>
      )}

      {/* Location Info */}
      {order && (order.locationFrom || order.locationTo) && (
        <Card style={styles.section} elevation="sm">
          <Text style={styles.sectionTitle}>Locations</Text>
          
          {/* Pickup Location */}
          {order.locationFrom && (
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                <Text style={styles.locationLabel}>Pickup Location</Text>
              </View>
              <Text style={styles.locationAddress}>
                Lat: {order.locationFrom.latitude.toFixed(6)}, Lng: {order.locationFrom.longitude.toFixed(6)}
              </Text>
              <Button
                title="Get Directions"
                onPress={() => openMaps(order.locationFrom!.latitude, order.locationFrom!.longitude)}
                variant="outline"
                size="small"
                icon={<Ionicons name="navigate" size={16} color={colors.primary} />}
                style={styles.directionsButton}
              />
            </View>
          )}

          {/* Delivery Location */}
          {order.locationTo && (
            <View style={[styles.locationCard, { marginTop: spacing.md }]}>
              <View style={styles.locationHeader}>
                <View style={[styles.locationDot, { backgroundColor: colors.danger }]} />
                <Text style={styles.locationLabel}>Delivery Location</Text>
              </View>
              <Text style={styles.locationAddress}>
                Lat: {order.locationTo.latitude.toFixed(6)}, Lng: {order.locationTo.longitude.toFixed(6)}
              </Text>
              <Button
                title="Get Directions"
                onPress={() => openMaps(order.locationTo!.latitude, order.locationTo!.longitude)}
                variant="outline"
                size="small"
                icon={<Ionicons name="navigate" size={16} color={colors.primary} />}
                style={styles.directionsButton}
              />
            </View>
          )}
        </Card>
      )}

      {/* Payment Info */}
      {order && (
        <Card style={styles.section} elevation="sm">
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Initial Fee</Text>
            <Text style={styles.value}>{formatCurrency(order.initialFee)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Discount</Text>
              <Text style={[styles.value, { color: colors.success }]}>
                -{formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.finalFee || order.initialFee - order.discount)}
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.16)',
    borderRadius: 18,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(95, 149, 152, 0.12)',
  },
  label: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  value: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  notes: {
    textAlign: 'left',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  callButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  locationCard: {
    backgroundColor: 'rgba(95, 149, 152, 0.08)',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.16)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  locationLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  locationAddress: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  directionsButton: {
    alignSelf: 'flex-start',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(95, 149, 152, 0.18)',
  },
  totalLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.success,
  },
});
