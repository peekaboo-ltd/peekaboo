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
   * Load dashboard data on mount and keep it fresh while dashboard is in use.
   * This provides near real-time updates without needing manual refresh.
   */
  useEffect(() => {
    // Initial load
    fetchDashboardData();

    // Poll for updates at a regular interval
    const intervalId = setInterval(() => {
      refreshDashboard();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchDashboardData, refreshDashboard]);

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
