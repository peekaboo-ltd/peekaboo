import { UUID } from ".";
import { RoleTypes } from "../constants/role.constants";
import {
  OrderStatus,
  OrderAssignmentStatus,
} from "../constants/order.constants";
import { TierBreakdown } from "../constants/businessPlan.constants";
import { KpayPaymentStatus } from "./kpay.types";

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type SummaryChartMetric =
  | "ORDERS"
  | "REVENUE"
  | "DELIVERIES"
  | "ACTIVE_USERS";
export type SummaryChartPeriod = "7d" | "30d" | "90d";

export interface OrderTrendData {
  period: string;
  data: ChartDataPoint[];
}

export interface RevenueTrendData {
  period: string;
  data: ChartDataPoint[];
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
  type: "order" | "assignment" | "payment";
  title: string;
  description: string;
  status: string;
  timestamp: Date;
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
  completedToday: number;
  todayDeliveries: number;
  totalEarnings: number;
  totalAssignments: number;
  bonusActive: boolean;
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
  monthlyOrderVolume: ChartDataPoint[];
  averageOrderValue: number;
  deliverySuccessRate: number;
}

export interface DashboardMetrics {
  role: RoleTypes;
  metrics: AdminMetrics | RiderMetrics | CustomerMetrics | BusinessMetrics;
}

export interface BusinessReportSummary {
  totalOrders: number;
  completedDeliveries: number;
  completionRate: number;
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  averageOrderValue: number;
}

export interface BusinessReportPieSlice {
  label: string;
  value: number;
  color: string;
}

export interface BusinessReportDeliveryRow {
  referenceId: string;
  riderName: string;
  completedAt: Date;
  amount: number;
  status: OrderAssignmentStatus;
}

export interface BusinessReportData {
  organizationName?: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  summary: BusinessReportSummary;
  deliveriesLineChart: ChartDataPoint[];
  assignmentStatusPie: BusinessReportPieSlice[];
  deliveriesTable: BusinessReportDeliveryRow[];
  currentBillingBreakdown?: TierBreakdown[];
  currentBillingPlanName?: string;
}
