import { create } from 'zustand';
import { DashboardStats, RecentActivity } from '../types';
import { dashboardAPI } from '../services/api/dashboard';
import { handleAPIError, getErrorMessage } from '../utils/errorHandler';

interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  pendingCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  recentActivity: [],
  pendingCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchDashboardData: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const dashboardData = await dashboardAPI.getDashboardData();
      const stats: DashboardStats = dashboardData.stats;
      
      set({
        stats,
        recentActivity: dashboardData.recentActivity || [],
        pendingCount: stats.pendingAssignments,
        isLoading: false,
      });
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
    }
  },

  fetchStats: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const stats = await dashboardAPI.getStats();
      
      set({
        stats,
        isLoading: false,
      });
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
      });
    }
  },

  refreshDashboard: async (): Promise<void> => {
    set({ isRefreshing: true });
    
    try {
      const dashboardData = await dashboardAPI.getDashboardData();
      const stats: DashboardStats = dashboardData.stats;
      
      set({
        stats,
        recentActivity: dashboardData.recentActivity || [],
        pendingCount: stats.pendingAssignments,
        isRefreshing: false,
      });
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isRefreshing: false,
        error: getErrorMessage(appError),
      });
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
