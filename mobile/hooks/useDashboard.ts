import { useCallback, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

/**
 * Hook for dashboard operations
 */
export const useDashboard = () => {
  const {
    stats,
    recentActivity,
    pendingCount,
    isLoading,
    isRefreshing,
    error,
    fetchDashboardData,
    refreshDashboard,
    clearError,
  } = useDashboardStore();

  /**
   * Load dashboard data on mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    await refreshDashboard();
  }, [refreshDashboard]);

  /**
   * Reload dashboard data
   */
  const reload = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentActivity,
    pendingCount,
    isLoading,
    isRefreshing,
    error,
    refresh: handleRefresh,
    reload,
    clearError,
  };
};
