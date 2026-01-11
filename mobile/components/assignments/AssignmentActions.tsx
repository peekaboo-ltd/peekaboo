import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '../ui/Button';
import { OrderAssignmentStatus } from '../../types';
import { colors, spacing } from '../../utils/constants';

interface AssignmentActionsProps {
  status: OrderAssignmentStatus;
  onAccept: () => void;
  onReject: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

export const AssignmentActions: React.FC<AssignmentActionsProps> = ({
  status,
  onAccept,
  onReject,
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

  // Pending status - Show Accept/Reject
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

  // Active status - Show Complete
  if (status === OrderAssignmentStatus.ACTIVE && onComplete) {
    return (
      <View style={styles.container}>
        <Button
          title="Mark as Completed"
          onPress={handleComplete}
          variant="primary"
          loading={isLoading}
          fullWidth
          style={styles.completeButton}
        />
      </View>
    );
  }

  // Completed or other statuses - No actions
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
