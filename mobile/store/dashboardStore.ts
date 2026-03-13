import { create } from 'zustand';
import { DashboardStats, RecentActivity } from '../types';
import { dashboardAPI } from '../services/api/dashboard';
import { assignmentsAPI } from '../services/api/assignments';
import { handleAPIError, getErrorMessage } from '../utils/errorHandler';
import { OrderAssignmentStatus } from '../types';

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
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch dashboard data and assignments in parallel
      const [dashboardData, pendingAssignments, activeAssignments, completedPage] =
        await Promise.all([
          dashboardAPI.getDashboardData(),
          assignmentsAPI.getPending(),
          assignmentsAPI.getActive(),
          assignmentsAPI.getAll({ status: OrderAssignmentStatus.COMPLETED, page: 1, size: 200 }),
        ]);

      const completedToday = completedPage.data.filter((a) => {
        const updated = new Date(a.updatedAt);
        return !Number.isNaN(updated.getTime()) && updated >= startOfDay;
      }).length;

      const todayDeliveries = pendingAssignments.length + activeAssignments.length + completedToday;
      const mergedStats: DashboardStats = {
        ...dashboardData.stats,
        pendingAssignments: pendingAssignments.length,
        completedToday,
        todayDeliveries,
      };
      
      set({
        stats: mergedStats,
        recentActivity: dashboardData.recentActivity || [],
        pendingCount: pendingAssignments.length,
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
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [dashboardData, pendingAssignments, activeAssignments, completedPage] =
        await Promise.all([
          dashboardAPI.getDashboardData(),
          assignmentsAPI.getPending(),
          assignmentsAPI.getActive(),
          assignmentsAPI.getAll({ status: OrderAssignmentStatus.COMPLETED, page: 1, size: 200 }),
        ]);

      const completedToday = completedPage.data.filter((a) => {
        const updated = new Date(a.updatedAt);
        return !Number.isNaN(updated.getTime()) && updated >= startOfDay;
      }).length;

      const todayDeliveries = pendingAssignments.length + activeAssignments.length + completedToday;
      const mergedStats: DashboardStats = {
        ...dashboardData.stats,
        pendingAssignments: pendingAssignments.length,
        completedToday,
        todayDeliveries,
      };
      
      set({
        stats: mergedStats,
        recentActivity: dashboardData.recentActivity || [],
        pendingCount: pendingAssignments.length,
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
