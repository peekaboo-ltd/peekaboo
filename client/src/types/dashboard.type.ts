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

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface BusinessMetrics {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  pendingPayments: number;
  ordersByStatus: OrderStatusCount[];
  recentActivity: RecentActivity[];
  monthlyOrderVolume: { label: string; value: number }[] | ChartDataPoint[];
  averageOrderValue: number;
  deliverySuccessRate: number;
}

export interface DashboardMetrics {
  role: RoleTypes;
  metrics: AdminMetrics | RiderMetrics | CustomerMetrics | BusinessMetrics;
}

import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface MetricCardData {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
  href?: string;
  icon?: IconProp;
  sparklineData?: number[];
  sparklineType?: 'line' | 'bar';
}

// Fleet efficiency chart data
export interface FleetEfficiencyData {
  name: string;
  value: number;
  color: string;
}

// Vehicle status chart data
export interface VehicleStatusData {
  name: string;
  value: number;
  color: string;
}

// Fleet metrics for dashboard
export interface FleetMetrics {
  efficiencyPercentage: number;
  onTheMove: number;
  unutilized: number;
  inMaintenance: number;
}

// Vehicle metrics for dashboard
export interface VehicleMetrics {
  totalVehicles: number;
  onRoad: number;
  parked: number;
  inService: number;
}
