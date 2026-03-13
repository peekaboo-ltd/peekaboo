import apiClient from './client';
import { DashboardData, DashboardStats, RecentActivity } from '../../types';

type DashboardMetricsRole = 'ADMIN' | 'STAFF' | 'BUSINESS' | 'RIDER' | 'CUSTOMER';

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface ServerRecentActivity {
  id: string;
  type: 'order' | 'assignment' | 'payment';
  title: string;
  description: string;
  status: string;
  timestamp: string | Date;
}

interface RiderMetrics {
  activeAssignments: number;
  completedDeliveries: number;
  deliveriesThisMonth: number;
  completionRate: number;
  acceptanceRate: number;
  pendingAssignments: number;
  recentActivity: ServerRecentActivity[];
}

interface DashboardMetrics {
  role: DashboardMetricsRole;
  metrics: any;
}

const toIsoString = (value: string | Date) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
};

const mapRecentActivity = (items: ServerRecentActivity[] | undefined): RecentActivity[] => {
  if (!items || items.length === 0) return [];

  return items.map((a) => {
    const status = String(a.status || '').toUpperCase();
    let type: RecentActivity['type'] = 'order_delivered';

    if (a.type === 'assignment') {
      if (status.includes('REJECT')) type = 'assignment_rejected';
      else if (status.includes('COMPLETE')) type = 'assignment_completed';
      else if (status.includes('ACTIVE') || status.includes('ACCEPT')) type = 'assignment_accepted';
      else type = 'assignment_accepted';
    } else if (a.type === 'order') {
      type = 'order_delivered';
    }

    return {
      id: String(a.id),
      type,
      description: a.description || a.title || 'Activity',
      timestamp: toIsoString(a.timestamp),
    };
  });
};

const buildRiderDashboardData = (rider: RiderMetrics): DashboardData => {
  const pending = Number(rider.pendingAssignments || 0);
  const active = Number(rider.activeAssignments || 0);
  const completedTotal = Number(rider.completedDeliveries || 0);
  const totalAssignments = pending + active + completedTotal;

  const stats: DashboardStats = {
    // These are derived from rider metrics; "today" counts are filled in by the store
    todayDeliveries: pending + active,
    pendingAssignments: pending,
    completedToday: 0,
    totalEarnings: 0,
    completionRate: Number(rider.completionRate || 0),
    totalAssignments,
  };

  return {
    stats,
    recentActivity: mapRecentActivity(rider.recentActivity),
  };
};

/**
 * Dashboard API endpoints
 */
export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const data = await dashboardAPI.getDashboardData();
    return data.stats;
  },

  /**
   * Get dashboard data (stats + recent activity)
   */
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard');
    const payload = response.data.data;

    if (payload?.role === 'RIDER') {
      return buildRiderDashboardData(payload.metrics as RiderMetrics);
    }

    // Fallback for other roles: keep UI working with safe defaults.
    return {
      stats: {
        todayDeliveries: 0,
        pendingAssignments: 0,
        completedToday: 0,
        totalEarnings: 0,
        completionRate: 0,
        totalAssignments: 0,
      },
      recentActivity: [],
    };
  },
};
