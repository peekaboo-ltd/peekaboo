import { useCallback, useEffect } from 'react';
import { useAssignmentStore } from '../store/assignmentStore';
import { OrderAssignmentStatus, Assignment } from '../types';

/**
 * Hook for assignment operations
 */
export const useAssignments = () => {
  const {
    assignments,
    selectedAssignment,
    isLoading,
    isRefreshing,
    error,
    filter,
    hasMore,
    fetchAssignments,
    fetchMoreAssignments,
    fetchAssignmentById,
    acceptAssignment,
    rejectAssignment,
    refreshAssignments,
    setFilter,
    setSelectedAssignment,
    clearError,
  } = useAssignmentStore();

  /**
   * Load assignments on mount
   */
  useEffect(() => {
    fetchAssignments();
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((newFilter: OrderAssignmentStatus | 'ALL') => {
    setFilter(newFilter);
  }, [setFilter]);

  /**
   * Handle accept assignment
   */
  const handleAccept = useCallback(async (id: string): Promise<boolean> => {
    return await acceptAssignment(id);
  }, [acceptAssignment]);

  /**
   * Handle reject assignment
   */
  const handleReject = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    return await rejectAssignment(id, reason);
  }, [rejectAssignment]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    await refreshAssignments();
  }, [refreshAssignments]);

  /**
   * Load more assignments
   */
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchMoreAssignments();
    }
  }, [hasMore, isLoading, fetchMoreAssignments]);

  /**
   * Get assignment by ID
   */
  const getAssignment = useCallback(async (id: string): Promise<Assignment | null> => {
    return await fetchAssignmentById(id);
  }, [fetchAssignmentById]);

  /**
   * Get pending assignments count
   */
  const pendingCount = assignments.filter(
    a => a.status === OrderAssignmentStatus.PENDING
  ).length;

  /**
   * Get active assignments count
   */
  const activeCount = assignments.filter(
    a => a.status === OrderAssignmentStatus.ACTIVE
  ).length;

  return {
    assignments,
    selectedAssignment,
    isLoading,
    isRefreshing,
    error,
    filter,
    hasMore,
    pendingCount,
    activeCount,
    setFilter: handleFilterChange,
    acceptAssignment: handleAccept,
    rejectAssignment: handleReject,
    refreshAssignments: handleRefresh,
    loadMore: handleLoadMore,
    getAssignment,
    setSelectedAssignment,
    clearError,
  };
};
