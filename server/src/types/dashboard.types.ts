import { UUID } from '.';
import { RoleTypes } from '../constants/role.constants';
import { OrderStatus, OrderAssignmentStatus } from '../constants/order.constants';
import { KpayPaymentStatus } from './kpay.types';

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface AssignmentStatusCount {
  status: OrderAssignmentStatus;
  count: number;
}

export interface PaymentStatusCount {
  status: KpayPaymentStatus;
  count: number;
}

export interface RecentActivity {
  id: UUID;
  type: 'order' | 'assignment' | 'payment';
  title: string;
  description: string;
  status: string;
  timestamp: Date;
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
