export interface DashboardStats {
  todayDeliveries: number;
  pendingAssignments: number;
  completedToday: number;
  totalEarnings: number;
  completionRate: number;
  totalAssignments: number;
}

export interface RecentActivity {
  id: string;
  type: 'assignment_accepted' | 'assignment_completed' | 'assignment_rejected' | 'order_delivered';
  description: string;
  timestamp: string;
  orderId?: string;
  assignmentId?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
}
