import { RoleTypes } from './auth.type';
import { UUID } from '.';

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface AssignmentStatusCount {
  status: string;
  count: number;
}

export interface PaymentStatusCount {
  status: string;
  count: number;
}

export interface RecentActivity {
  id: UUID;
  type: 'order' | 'assignment' | 'payment';
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

export interface AdminMetrics {
  totalOrders: number;
  ordersByStatus: OrderStatusCount[];
  totalRevenue: number;
  revenueThisMonth: number;
  activeAssignments: number;
  totalAssignments: number;
  activeRiders: number;
  totalCustomers: number;
  pendingPayments: number;
  completedPayments: number;
  recentActivity: RecentActivity[];
}

export interface RiderMetrics {
  activeAssignments: number;
  completedDeliveries: number;
  earningsThisMonth: number;
  totalEarnings: number;
  acceptanceRate: number;
  pendingAssignments: number;
  assignmentsByStatus: AssignmentStatusCount[];
  recentActivity: RecentActivity[];
}

export interface CustomerMetrics {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  pendingPayments: number;
  ordersByStatus: OrderStatusCount[];
  recentActivity: RecentActivity[];
}

export interface DashboardMetrics {
  role: RoleTypes;
  metrics: AdminMetrics | RiderMetrics | CustomerMetrics;
}

export interface MetricCardData {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}
