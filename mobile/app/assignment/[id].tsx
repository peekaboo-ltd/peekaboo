import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { AssignmentDetails } from '../../components/assignments/AssignmentDetails';
import { AssignmentDetailsSkeleton } from '../../components/assignments/AssignmentDetailsSkeleton';
import { AssignmentActions } from '../../components/assignments/AssignmentActions';
import { Input } from '../../components/ui/Input';
import { useAssignmentStore } from '../../store/assignmentStore';
import { OrderAssignmentStatus, OrderStatus } from '../../types';
import { colors, spacing, typography } from '../../utils/constants';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');

  const {
    selectedAssignment,
    isLoading,
    error,
    fetchAssignmentById,
    acceptAssignment,
    rejectAssignment,
    confirmOrderDispatch,
    completeOrder,
    clearError,
  } = useAssignmentStore();

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id);
    }

    return () => {
      clearError();
    };
  }, [id]);

  const latestOrderStatus = useMemo(() => {
    const activities = selectedAssignment?.order?.activities || [];
    if (activities.length === 0) {
      return selectedAssignment?.order?.status;
    }

    const sorted = [...activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted[0]?.status || selectedAssignment?.order?.status;
  }, [selectedAssignment]);

  const isActiveAssignment = selectedAssignment?.status === OrderAssignmentStatus.ACTIVE;
  const canConfirmDispatch =
    isActiveAssignment && latestOrderStatus !== OrderStatus.IN_TRANSIT && latestOrderStatus !== OrderStatus.COMPLETED;
  const canComplete =
    isActiveAssignment && latestOrderStatus === OrderStatus.IN_TRANSIT;

  const handleAccept = async () => {
    if (!id) return;

    setIsActionLoading(true);
    const success = await acceptAssignment(id);
    setIsActionLoading(false);

    if (success) {
      Alert.alert(
        'Assignment Accepted',
        'You have successfully accepted this assignment.',
        [{ text: 'OK' }]
      );
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleReject = async () => {
    if (!id) return;

    setIsActionLoading(true);
    const success = await rejectAssignment(id);
    setIsActionLoading(false);

    if (success) {
      Alert.alert(
        'Assignment Rejected',
        'You have rejected this assignment.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!selectedAssignment?.orderId) return;

    if (!trackingIdInput.trim()) {
      Alert.alert('Tracking ID Required', 'Please enter the order tracking ID to confirm dispatch.');
      return;
    }

    setIsActionLoading(true);
    const success = await confirmOrderDispatch(selectedAssignment.orderId, trackingIdInput.trim());
    setIsActionLoading(false);

    if (success) {
      Alert.alert('Order in Transit', 'Order has been confirmed and marked as in transit.');
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleComplete = async () => {
    if (!selectedAssignment?.orderId) return;

    setIsActionLoading(true);
    const success = await completeOrder(selectedAssignment.orderId);
    setIsActionLoading(false);

    if (success) {
      Alert.alert('Order Completed', 'Order has been marked as completed.');
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  if (isLoading && !selectedAssignment) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerBackTitle: 'Back',
          }}
        />
        <AssignmentDetailsSkeleton />
      </View>
    );
  }

  if (!selectedAssignment) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen
          options={{
            title: 'Not Found',
            headerBackTitle: 'Back',
          }}
        />
      </View>
    );
  }

  const getHeaderTitle = () => {
    if (selectedAssignment.order?.referenceId) {
      return `Order #${selectedAssignment.order.referenceId}`;
    }
    return 'Assignment Details';
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>
      <Stack.Screen
        options={{
          title: getHeaderTitle(),
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AssignmentDetails assignment={selectedAssignment} />

        {canConfirmDispatch && (
          <View style={styles.trackingCard}>
            <Text style={styles.trackingLabel}>Confirm Dispatch</Text>
            <Input
              value={trackingIdInput}
              onChangeText={setTrackingIdInput}
              placeholder="Enter tracking ID"
              autoCapitalize="characters"
            />
          </View>
        )}
      </ScrollView>

      <AssignmentActions
        status={selectedAssignment.status}
        showConfirmDispatch={canConfirmDispatch}
        onAccept={handleAccept}
        onReject={handleReject}
        onConfirmDispatch={canConfirmDispatch ? handleConfirmDispatch : undefined}
        onComplete={canComplete ? handleComplete : undefined}
        isLoading={isActionLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(95, 149, 152, 0.16)',
    top: -120,
    right: -60,
  },
  glowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 84, 109, 0.12)',
    bottom: -110,
    left: -80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  trackingCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.16)',
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  trackingLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});
