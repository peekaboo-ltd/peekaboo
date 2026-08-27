import { RoleTypes } from './auth.type';
import { UUID } from '.';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

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
  ordersThisMonth: number;
  ordersByStatus: OrderStatusCount[];
  totalRevenue: number;
  billingAndPaymentsThisMonth: number;
  pendingStatuses: number;
  activeAssignments: number;
  totalAssignments: number;
  activeRiders: number;
  totalCustomers: number;
  pendingPayments: number;
  completedPayments: number;
  recentActivity: RecentActivity[];
  totalOrganizations: number;
  businessOrdersCount: number;
  businessOrdersPercentage: number;
}

export interface RiderMetrics {
  activeAssignments: number;
  completedDeliveries: number;
  cancelledAssignments: number;
  deliveriesThisMonth: number;
  completionRate: number;
  acceptanceRate: number;
  pendingAssignments: number;
  assignmentsByStatus: AssignmentStatusCount[];
  recentActivity: RecentActivity[];
  totalEarnings: number;
  earningsThisMonth: number;
  averageEarningPerDelivery: number;
}

export interface CustomerMetrics {
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  completedOrders: number;
  ordersThisMonth: number;
  cancelledOrders: number;
  deliverySuccessRate: number;
  ordersByStatus: OrderStatusCount[];
  recentActivity: RecentActivity[];
  totalSpent: number;
  averageOrderCost: number;
  spendingThisMonth: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface BusinessMetrics {
  currentAmountDue: number;
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
  teamMembers: number;
  ordersThisWeek: number;
  pendingPayments: number;
  completedPayments: number;
  billingAndPaymentsThisMonth: number;
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

export type DashboardAccent =
  | 'blue'
  | 'teal'
  | 'amber'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'slate';

export interface MetricCardData {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accent?: DashboardAccent;
  href?: string;
  query?: Record<string, string>;
  to?: string;
  icon?: IconProp;
  sparklineData?: number[];
  sparklineType?: 'line' | 'bar';
  sparkColor?: string;
  comparisonLabel?: string;
  note?: string;
  footerText?: string;
  variant?: 'default' | 'compact';
}

export interface DashboardActionLink {
  label: string;
  to: string;
  icon: IconProp;
}

export interface DashboardStatusBreakdownItem {
  label: string;
  value: number;
  tone?: DashboardAccent;
}

export interface DashboardSupportCardData {
  title: string;
  value: string;
  subtitle: string;
  chartType: 'line' | 'bar' | 'status';
  accent?: DashboardAccent;
  data?: ChartDataPoint[];
  breakdown?: DashboardStatusBreakdownItem[];
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
