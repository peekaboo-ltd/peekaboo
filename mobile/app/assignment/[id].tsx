import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  Keyboard,
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    selectedAssignment,
    isLoading,
    error,
    fetchAssignmentById,
    acceptAssignment,
    rejectAssignment,
    recoverAssignment,
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
    isActiveAssignment &&
    latestOrderStatus !== OrderStatus.IN_TRANSIT &&
    latestOrderStatus !== OrderStatus.DELIVERED &&
    latestOrderStatus !== OrderStatus.COMPLETED;
  const canComplete =
    isActiveAssignment &&
    (latestOrderStatus === OrderStatus.IN_TRANSIT ||
      latestOrderStatus === OrderStatus.DELIVERED);

  const refresh = () => {
    if (id) fetchAssignmentById(id);
  };

  const handleAccept = async () => {
    if (!id) return;

    setIsActionLoading(true);
    const success = await acceptAssignment(id);
    setIsActionLoading(false);

    if (success) {
      refresh();
      Alert.alert(
        'Assignment Accepted',
        'You have successfully accepted this assignment.',
        [{ text: 'OK' }]
      );
    } else {
      const message = useAssignmentStore.getState().error || 'Failed to accept assignment.';
      Alert.alert('Error', message);
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
    } else {
      const message = useAssignmentStore.getState().error || 'Failed to reject assignment.';
      Alert.alert('Error', message);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!selectedAssignment?.orderId) return;

    setIsActionLoading(true);
    const success = await confirmOrderDispatch(selectedAssignment.orderId);
    setIsActionLoading(false);

    if (success) {
      refresh();
      Alert.alert('Order in Transit', 'Order has been confirmed and marked as in transit.');
    } else {
      const message = useAssignmentStore.getState().error || 'Failed to confirm dispatch.';
      Alert.alert('Error', message);
    }
  };

  const handleRecover = async () => {
    if (!id) return;

    setIsActionLoading(true);
    const success = await recoverAssignment(id);
    setIsActionLoading(false);

    if (success) {
      refresh();
      Alert.alert(
        'Assignment Recovered',
        'This assignment has been restored and is ready for you to accept.',
        [{ text: 'OK' }]
      );
    } else {
      const message =
        useAssignmentStore.getState().error ||
        'Failed to recover assignment.';
      Alert.alert('Unable to Recover', message);
      refresh();
    }
  };

  const handleComplete = async () => {
    if (!selectedAssignment?.orderId) return;

    const enteredTrackingId = trackingIdInput.trim();
    if (!enteredTrackingId) {
      Alert.alert('OTP required', 'Enter the order OTP to complete this delivery.');
      return;
    }

    setIsActionLoading(true);
    const success = await completeOrder(selectedAssignment.orderId, enteredTrackingId);
    setIsActionLoading(false);

    if (success) {
      refresh();
      Alert.alert('Order Completed', 'Order has been marked as completed.');
    } else {
      const message = useAssignmentStore.getState().error || 'Failed to complete order.';
      Alert.alert('Error', message);
      refresh();
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

  const handleOtpFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
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
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          keyboardHeight > 0 && { paddingBottom: keyboardHeight },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AssignmentDetails assignment={selectedAssignment} />

        {canComplete && (
          <View style={styles.trackingCard}>
            <Text style={styles.trackingLabel}>Complete Order Verification</Text>
            <Input
              value={trackingIdInput}
              onChangeText={setTrackingIdInput}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              onFocus={handleOtpFocus}
            />
          </View>
        )}

        <AssignmentActions
          status={selectedAssignment.status}
          showConfirmDispatch={canConfirmDispatch}
          onAccept={handleAccept}
          onReject={handleReject}
          onRecover={selectedAssignment.status === OrderAssignmentStatus.REJECTED ? handleRecover : undefined}
          onConfirmDispatch={canConfirmDispatch ? handleConfirmDispatch : undefined}
          onComplete={canComplete ? handleComplete : undefined}
          isLoading={isActionLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
