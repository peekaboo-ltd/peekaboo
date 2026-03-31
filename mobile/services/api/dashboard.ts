import apiClient from './client';
import { DashboardData, DashboardStats, RecentActivity } from '../../types';

type DashboardMetricsRole = 'ADMIN' | 'STAFF' | 'BUSINESS' | 'RIDER' | 'CUSTOMER';

interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface SubmitProblemReportPayload {
  description: string;
  capturedAt: string;
  mediaType: 'image' | 'video';
  evidenceUri: string;
  locationLabel?: string;
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
  activeAssignments?: number;
  completedDeliveries?: number;
  deliveriesThisMonth?: number;
  completionRate?: number;
  acceptanceRate?: number;
  pendingAssignments?: number;
  todayDeliveries?: number;
  completedToday?: number;
  totalEarnings?: number;
  totalAssignments?: number;
  bonusActive?: boolean;
  recentActivity?: ServerRecentActivity[];
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

const getTodayRange = () => {
  return getDayRange(new Date());
};

const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const day = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;

  return {
    day,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
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
  const completedToday = Number(rider.completedToday ?? 0);
  const totalAssignments = Number(rider.totalAssignments || (pending + active + completedTotal));
  const todayDeliveries = Number(rider.todayDeliveries || completedToday);
  const totalEarnings = Number(rider.totalEarnings || 0);
  const bonusActive = Boolean(rider.bonusActive ?? false);

  const stats: DashboardStats = {
    todayDeliveries,
    pendingAssignments: pending,
    completedToday,
    totalEarnings,
    completionRate: Number(rider.completionRate || 0),
    totalAssignments,
    bonusActive,
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
  getStats: async (date?: Date): Promise<DashboardStats> => {
    const data = await dashboardAPI.getDashboardData(date);
    return data.stats;
  },

  /**
   * Get dashboard data (stats + recent activity)
   */
  getDashboardData: async (date?: Date): Promise<DashboardData> => {
    const dayRange = date ? getDayRange(date) : getTodayRange();
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard', {
      params: {
        ...dayRange,
        period: 'today',
      },
    });
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

  submitProblemReport: async (payload: SubmitProblemReportPayload): Promise<void> => {
    const formData: FormData = new FormData();
    formData.append('description', payload.description);
    formData.append('capturedAt', payload.capturedAt);
    formData.append('mediaType', payload.mediaType);
    if (payload.locationLabel) {
      formData.append('locationLabel', payload.locationLabel);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evidence: any = {
      uri: payload.evidenceUri,
      name: `problem-report-${Date.now()}${payload.mediaType === 'video' ? '.mp4' : '.jpg'}`,
      type: payload.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
    };
    formData.append('evidence', evidence);

    await apiClient.post<ApiResponse<unknown>>('/dashboard/report-problem', formData);
  },
};
