import { AdminMetrics, RiderMetrics, CustomerMetrics, MetricCardData } from '@/types/dashboard.type';

export const formatCurrency = (amount: number, currency = 'RWF'): string => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getAdminMetricCards = (metrics: AdminMetrics): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: metrics.totalOrders,
    colorClass: 'text-primary-500',
  },
  {
    label: 'Revenue This Month',
    value: formatCurrency(metrics.revenueThisMonth),
    colorClass: 'text-green-600',
  },
  {
    label: 'Total Revenue',
    value: formatCurrency(metrics.totalRevenue),
    colorClass: 'text-primary-900',
  },
  {
    label: 'Active Assignments',
    value: metrics.activeAssignments,
    colorClass: 'text-amber-600',
  },
  {
    label: 'Active Riders',
    value: metrics.activeRiders,
    colorClass: 'text-purple-600',
  },
  {
    label: 'Total Customers',
    value: metrics.totalCustomers,
    colorClass: 'text-pink-600',
  },
  {
    label: 'Pending Payments',
    value: metrics.pendingPayments,
    colorClass: 'text-amber-600',
  },
  {
    label: 'Completed Payments',
    value: metrics.completedPayments,
    colorClass: 'text-green-600',
  },
];

export const getRiderMetricCards = (metrics: RiderMetrics): MetricCardData[] => [
  {
    label: 'Active Assignments',
    value: metrics.activeAssignments,
    colorClass: 'text-primary-500',
  },
  {
    label: 'Completed Deliveries',
    value: metrics.completedDeliveries,
    colorClass: 'text-green-600',
  },
  {
    label: 'Earnings This Month',
    value: formatCurrency(metrics.earningsThisMonth),
    colorClass: 'text-primary-900',
  },
  {
    label: 'Total Earnings',
    value: formatCurrency(metrics.totalEarnings),
    colorClass: 'text-green-600',
  },
  {
    label: 'Acceptance Rate',
    value: `${metrics.acceptanceRate}%`,
    colorClass: metrics.acceptanceRate >= 80 ? 'text-green-600' : 'text-amber-600',
  },
  {
    label: 'Pending Assignments',
    value: metrics.pendingAssignments,
    colorClass: 'text-amber-600',
  },
];

export const getCustomerMetricCards = (metrics: CustomerMetrics): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: metrics.totalOrders,
    colorClass: 'text-primary-500',
  },
  {
    label: 'Active Orders',
    value: metrics.activeOrders,
    colorClass: 'text-amber-600',
  },
  {
    label: 'Completed Orders',
    value: metrics.completedOrders,
    colorClass: 'text-green-600',
  },
  {
    label: 'Total Spent',
    value: formatCurrency(metrics.totalSpent),
    colorClass: 'text-primary-900',
  },
  {
    label: 'Pending Payments',
    value: metrics.pendingPayments,
    colorClass: 'text-amber-600',
  },
];
