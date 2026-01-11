import apiClient from './client';
import { DashboardStats, DashboardData } from '../../types';

/**
 * Dashboard API endpoints
 */
export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard');
    return response.data;
  },

  /**
   * Get dashboard data (stats + recent activity)
   */
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/dashboard');
    return response.data;
  },
};
