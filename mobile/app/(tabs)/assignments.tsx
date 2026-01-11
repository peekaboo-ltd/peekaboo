import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { AssignmentFilters } from '../../components/assignments/AssignmentFilters';
import { useAssignments } from '../../hooks/useAssignments';
import { Assignment, OrderAssignmentStatus } from '../../types';
import { colors, typography, spacing } from '../../utils/constants';

export default function AssignmentsScreen() {
  const {
    assignments,
    isLoading,
    isRefreshing,
    error,
    filter,
    hasMore,
    setFilter,
    acceptAssignment,
    rejectAssignment,
    refreshAssignments,
    loadMore,
  } = useAssignments();

  const handleRefresh = useCallback(() => {
    refreshAssignments();
  }, [refreshAssignments]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const handleAssignmentPress = (assignment: Assignment) => {
    router.push(`/assignment/${assignment.id}`);
  };

  const handleAccept = async (id: string) => {
    await acceptAssignment(id);
  };

  const handleReject = async (id: string) => {
    await rejectAssignment(id);
  };

  const renderAssignment = ({ item }: { item: Assignment }) => (
    <AssignmentCard
      assignment={item}
      onPress={() => handleAssignmentPress(item)}
      onAccept={
        item.status === OrderAssignmentStatus.PENDING
          ? () => handleAccept(item.id)
          : undefined
      }
      onReject={
        item.status === OrderAssignmentStatus.PENDING
          ? () => handleReject(item.id)
          : undefined
      }
    />
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.text.disabled} />
        <Text style={styles.emptyTitle}>No Assignments</Text>
        <Text style={styles.emptyText}>
          {filter === 'ALL'
            ? "You don't have any assignments yet."
            : `No ${filter.toLowerCase()} assignments found.`}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Assignments</Text>
        <Text style={styles.subtitle}>{assignments.length} total</Text>
      </View>

      {/* Filters */}
      <AssignmentFilters
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Assignments List */}
      <FlatList
        data={assignments}
        renderItem={renderAssignment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.danger,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
