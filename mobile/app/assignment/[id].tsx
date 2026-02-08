import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { AssignmentDetails } from '../../components/assignments/AssignmentDetails';
import { AssignmentDetailsSkeleton } from '../../components/assignments/AssignmentDetailsSkeleton';
import { AssignmentActions } from '../../components/assignments/AssignmentActions';
import { useAssignmentStore } from '../../store/assignmentStore';
import { OrderAssignmentStatus } from '../../types';
import { colors, spacing } from '../../utils/constants';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const { 
    selectedAssignment, 
    isLoading, 
    error,
    fetchAssignmentById,
    acceptAssignment,
    rejectAssignment,
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

  const handleComplete = async () => {
    // For now, just show a message as complete endpoint isn't fully implemented
    Alert.alert(
      'Complete Assignment',
      'This feature will be available soon.',
      [{ text: 'OK' }]
    );
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
      </ScrollView>

      {/* Action buttons at the bottom */}
      <AssignmentActions
        status={selectedAssignment.status}
        onAccept={handleAccept}
        onReject={handleReject}
        onComplete={
          selectedAssignment.status === OrderAssignmentStatus.ACTIVE 
            ? handleComplete 
            : undefined
        }
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
});
