import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '../ui/Button';
import { OrderAssignmentStatus } from '../../types';
import { colors, spacing } from '../../utils/constants';
import { useI18n } from '../../i18n';

interface AssignmentActionsProps {
  status: OrderAssignmentStatus;
  showConfirmDispatch?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onRecover?: () => void;
  onConfirmDispatch?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

export const AssignmentActions: React.FC<AssignmentActionsProps> = ({
  status,
  showConfirmDispatch = false,
  onAccept,
  onReject,
  onRecover,
  onConfirmDispatch,
  onComplete,
  isLoading = false,
}) => {
  const { t } = useI18n();
  const handleReject = () => {
    Alert.alert(
      t('assignmentActions.rejectTitle'),
      t('assignmentActions.rejectMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('assignment.reject'),
          onPress: onReject,
          style: 'destructive',
        },
      ]
    );
  };

  const handleConfirmDispatch = () => {
    Alert.alert(
      t('assignments.confirmTransit'),
      t('assignments.confirmTransitMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('assignments.confirmTransit'),
          onPress: onConfirmDispatch,
        },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      t('assignmentActions.completeTitle'),
      t('assignmentActions.completeMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('assignments.completed'),
          onPress: onComplete,
        },
      ]
    );
  };

  const handleRecover = () => {
    Alert.alert(
      t('assignmentActions.recoverTitle'),
      t('assignmentActions.recoverMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('assignmentActions.recover'),
          onPress: onRecover,
        },
      ]
    );
  };

  if (status === OrderAssignmentStatus.PENDING) {
    return (
      <View style={styles.container}>
        <Button
          title={t('assignment.reject')}
          onPress={handleReject}
          variant="danger"
          disabled={isLoading}
          style={styles.button}
        />
        <Button
          title={t('assignment.acceptAssignment')}
          onPress={onAccept}
          variant="primary"
          loading={isLoading}
          style={StyleSheet.flatten([styles.button, styles.primaryButton])}
        />
      </View>
    );
  }

  if (status === OrderAssignmentStatus.ACTIVE && (showConfirmDispatch || onComplete)) {
    return (
      <View style={styles.containerColumn}>
        {showConfirmDispatch && onConfirmDispatch && (
          <Button
            title={t('assignments.confirmTransit')}
            onPress={handleConfirmDispatch}
            variant="primary"
            loading={isLoading}
            fullWidth
          />
        )}
        {onComplete && (
          <Button
            title={t('assignmentActions.markCompleted')}
            onPress={handleComplete}
            variant="primary"
            loading={isLoading}
            fullWidth
            style={styles.completeButton}
          />
        )}
      </View>
    );
  }

  if (status === OrderAssignmentStatus.REJECTED && onRecover) {
    return (
      <View style={styles.containerColumn}>
        <Button
          title={t('assignmentActions.recoverAssignment')}
          onPress={handleRecover}
          variant="primary"
          loading={isLoading}
          fullWidth
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  containerColumn: {
    flexDirection: 'column',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  primaryButton: {
    flex: 1.5,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
});
