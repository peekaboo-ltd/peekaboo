import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Assignment, OrderAssignmentStatus, OrderStatus } from '../../types';
import { colors, typography, spacing } from '../../utils/constants';
import { getOrderStatusLabel } from '../../constants/order.constants';
import { 
  formatDateTime, 
  formatCurrency, 
  formatOrderRef,
  formatPhoneNumber,
} from '../../utils/formatters';
import { AssignmentDirectionsMap } from './AssignmentDirectionsMap';
import { useI18n } from '../../i18n';

interface AssignmentDetailsProps {
  assignment: Assignment;
}

interface AdministrativeDivisions {
  village?: string;
  cell?: string;
  sector?: string;
  district?: string;
  province?: string;
}

const formatCoordinateFallback = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

const LocationAdministrativeLabel: React.FC<{ latitude: number; longitude: number }> = ({
  latitude,
  longitude,
}) => {
  const [locationLabel, setLocationLabel] = useState(
    formatCoordinateFallback(latitude, longitude),
  );

  useEffect(() => {
    let isMounted = true;

    const fetchAdministrativeDivisions = async () => {
      try {
        const response = await fetch('https://menya.fly.dev/api/boundaries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as AdministrativeDivisions;
        const administrativeLabel = [data?.village, data?.cell, data?.sector, data?.district]
          .filter(Boolean)
          .join(', ');

        if (isMounted && administrativeLabel) {
          setLocationLabel(administrativeLabel);
        }
      } catch {
        // Keep coordinate fallback if lookup fails
      }
    };

    fetchAdministrativeDivisions();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  return (
    <Text
      style={styles.locationAddress}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {locationLabel}
    </Text>
  );
};

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

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({
  assignment,
}) => {
  const { t } = useI18n();
  const order = assignment.order;
  const [directionsVisible, setDirectionsVisible] = useState(false);
  const senderPhone =
    order?.sender?.phoneNumber || order?.senderPhoneNumber;
  const recipientPhone =
    order?.recipient?.phoneNumber || order?.recipientPhoneNumber;

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
        <Text style={styles.sectionTitle}>{t('assignmentInfo.orderInformation')}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t('assignmentInfo.orderId')}</Text>
          <Text style={styles.value}>
            {order?.referenceId ? formatOrderRef(order.referenceId) : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('assignmentInfo.assignment')}</Text>
          <Badge
            text={getStatusLabel(assignment.status, t)}
            variant={getStatusBadgeVariant(assignment.status)}
          />
        </View>
        {order && (
          <View style={styles.row}>
            <Text style={styles.label}>{t('assignmentInfo.orderStatus')}</Text>
            <Text style={styles.value}>
              {getOrderStatusLabel(getLatestOrderStatus(assignment))}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>{t('assignmentInfo.created')}</Text>
          <Text style={styles.value}>{formatDateTime(assignment.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('assignmentInfo.senderNumber')}</Text>
          <Text style={styles.value}>
            {senderPhone ? formatPhoneNumber(senderPhone) : t('assignmentInfo.na')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('assignmentInfo.receiverNumber')}</Text>
          <Text style={styles.value}>
            {recipientPhone ? formatPhoneNumber(recipientPhone) : t('assignmentInfo.na')}
          </Text>
        </View>
        {assignment.description && (
          <View style={styles.row}>
            <Text style={styles.label}>{t('assignmentInfo.notes')}</Text>
            <Text style={[styles.value, styles.notes]}>{assignment.description}</Text>
          </View>
        )}
      </Card>

      {/* Customer Info */}
      {order?.recipient && (
        <Card style={styles.section} elevation="sm">
          <Text style={styles.sectionTitle}>{t('assignmentInfo.customerInformation')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('assignmentInfo.name')}</Text>
            <Text style={styles.value}>{order.recipient.name || t('assignmentInfo.na')}</Text>
          </View>
          {order.recipient.phoneNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>{t('assignmentInfo.phone')}</Text>
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
          <Text style={styles.sectionTitle}>{t('assignmentInfo.locations')}</Text>
          {order.locationFrom && order.locationTo && (
            <Button
              title={t('assignmentInfo.showRoute')}
              onPress={() => setDirectionsVisible(true)}
              variant="outline"
              size="small"
              icon={<Ionicons name="map" size={16} color={colors.primary} />}
              style={[styles.directionsButton, { marginBottom: spacing.md }]}
            />
          )}
          {/* Pickup Location */}
          {order.locationFrom && (
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                <Text style={styles.locationLabel}>{t('assignment.pickupLocation')}</Text>
              </View>
              <LocationAdministrativeLabel
                latitude={order.locationFrom.latitude}
                longitude={order.locationFrom.longitude}
              />
              <Button
                title={t('assignmentInfo.getDirections')}
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
                <Text style={styles.locationLabel}>{t('assignment.deliveryLocation')}</Text>
              </View>
              <LocationAdministrativeLabel
                latitude={order.locationTo.latitude}
                longitude={order.locationTo.longitude}
              />
              <Button
                title={t('assignmentInfo.getDirections')}
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

      <Modal
        visible={directionsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDirectionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('assignmentInfo.routeModalTitle')}</Text>
            {order?.locationFrom && order?.locationTo && (
              <AssignmentDirectionsMap
                origin={order.locationFrom}
                destination={order.locationTo}
                onClose={() => setDirectionsVisible(false)}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Payment Info */}
      {order && (
        <Card style={styles.section} elevation="sm">
          <Text style={styles.sectionTitle}>{t('assignmentInfo.paymentInformation')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('assignmentInfo.initialFee')}</Text>
            <Text style={styles.value}>{formatCurrency(order.initialFee)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>{t('assignmentInfo.discount')}</Text>
              <Text style={[styles.value, { color: colors.success }]}>
                -{formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('assignmentInfo.total')}</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                order.finalFee ?? Math.max(0, (order.initialFee ?? 0) - order.discount),
              )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
