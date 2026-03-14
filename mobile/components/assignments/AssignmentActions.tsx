import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '../ui/Button';
import { OrderAssignmentStatus } from '../../types';
import { colors, spacing } from '../../utils/constants';

interface AssignmentActionsProps {
  status: OrderAssignmentStatus;
  showConfirmDispatch?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onConfirmDispatch?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

export const AssignmentActions: React.FC<AssignmentActionsProps> = ({
  status,
  showConfirmDispatch = false,
  onAccept,
  onReject,
  onConfirmDispatch,
  onComplete,
  isLoading = false,
}) => {
  const handleReject = () => {
    Alert.alert(
      'Reject Assignment',
      'Are you sure you want to reject this assignment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          onPress: onReject,
          style: 'destructive',
        },
      ]
    );
  };

  const handleConfirmDispatch = () => {
    Alert.alert(
      'Confirm & Start Transit',
      'This will mark the order as confirmed and in transit.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm & Start Transit',
          onPress: onConfirmDispatch,
        },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Assignment',
      'Mark this assignment as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          onPress: onComplete,
        },
      ]
    );
  };

  if (status === OrderAssignmentStatus.PENDING) {
    return (
      <View style={styles.container}>
        <Button
          title="Reject"
          onPress={handleReject}
          variant="danger"
          disabled={isLoading}
          style={styles.button}
        />
        <Button
          title="Accept Assignment"
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
            title="Confirm & Start Transit"
            onPress={handleConfirmDispatch}
            variant="primary"
            loading={isLoading}
            fullWidth
          />
        )}
        {onComplete && (
          <Button
            title="Mark as Completed"
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
