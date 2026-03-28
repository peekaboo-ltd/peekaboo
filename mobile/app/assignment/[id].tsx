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
import { useI18n } from '../../i18n';

export default function AssignmentDetailScreen() {
  const { t } = useI18n();
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
        t('assignmentDetail.acceptedTitle'),
        t('assignmentDetail.acceptedMessage'),
        [{ text: t('common.ok') }]
      );
    } else {
      const message = useAssignmentStore.getState().error || t('assignments.acceptFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  const handleReject = async () => {
    if (!id) return;

    setIsActionLoading(true);
    const success = await rejectAssignment(id);
    setIsActionLoading(false);

    if (success) {
      Alert.alert(
        t('assignmentDetail.rejectedTitle'),
        t('assignmentDetail.rejectedMessage'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } else {
      const message = useAssignmentStore.getState().error || t('assignments.rejectFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!selectedAssignment?.orderId) return;

    setIsActionLoading(true);
    const success = await confirmOrderDispatch(selectedAssignment.orderId);
    setIsActionLoading(false);

    if (success) {
      refresh();
      Alert.alert(t('assignmentDetail.transitTitle'), t('assignmentDetail.transitMessage'));
    } else {
      const message = useAssignmentStore.getState().error || t('assignmentDetail.confirmDispatchFailed');
      Alert.alert(t('common.error'), message);
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
        t('assignmentDetail.recoveredTitle'),
        t('assignmentDetail.recoveredMessage'),
        [{ text: t('common.ok') }]
      );
    } else {
      const message =
        useAssignmentStore.getState().error ||
        t('assignmentDetail.recoverFailed');
      Alert.alert(t('assignmentDetail.unableRecover'), message);
      refresh();
    }
  };

  const handleComplete = async () => {
    if (!selectedAssignment?.orderId) return;

    const enteredTrackingId = trackingIdInput.trim();
    if (!enteredTrackingId) {
      Alert.alert(t('assignmentDetail.otpRequiredTitle'), t('assignmentDetail.otpRequiredMessage'));
      return;
    }

    setIsActionLoading(true);
    const success = await completeOrder(selectedAssignment.orderId, enteredTrackingId);
    setIsActionLoading(false);

    if (success) {
      refresh();
      Alert.alert(t('assignmentDetail.completedTitle'), t('assignmentDetail.completedMessage'));
    } else {
      const message = useAssignmentStore.getState().error || t('assignmentDetail.completeFailed');
      Alert.alert(t('common.error'), message);
      refresh();
    }
  };

  if (isLoading && !selectedAssignment) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: t('assignmentDetail.loadingTitle'),
            headerBackTitle: t('common.back'),
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
            title: t('assignmentDetail.notFound'),
            headerBackTitle: t('common.back'),
          }}
        />
      </View>
    );
  }

  const getHeaderTitle = () => {
    if (selectedAssignment.order?.referenceId) {
      return `Order #${selectedAssignment.order.referenceId}`;
    }
    return t('assignmentDetail.title');
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
          headerBackTitle: t('common.back'),
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
            <Text style={styles.trackingLabel}>{t('assignmentDetail.completeVerification')}</Text>
            <Input
              value={trackingIdInput}
              onChangeText={setTrackingIdInput}
              placeholder={t('assignmentDetail.enterOtp')}
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
