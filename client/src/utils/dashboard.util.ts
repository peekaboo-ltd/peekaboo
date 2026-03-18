import {
  AdminMetrics,
  RiderMetrics,
  CustomerMetrics,
  BusinessMetrics,
  MetricCardData,
  DashboardAccent,
  DashboardStatusBreakdownItem,
  DashboardMetrics,
  RecentActivity,
} from '@/types/dashboard.type';
import { RoleTypes } from '@/types/auth.type';
import {
  faShoppingCart,
  faDollarSign,
  faChartLine,
  faClipboardList,
  faMotorcycle,
  faUsers,
  faClock,
  faCheckCircle,
  faTruck,
  faPercent,
  faHourglassHalf,
  faCalendarCheck,
  faCheckDouble,
  faBan,
  faUserGroup,
  faCalendarWeek,
} from '@fortawesome/free-solid-svg-icons';
import { capitalizeString, formatCurrency, formatNumbers } from './strings.util';

const STATUS_TONES: DashboardAccent[] = ['blue', 'teal', 'amber', 'violet', 'rose', 'slate'];

export const getAdminMetricCards = (
  metrics: AdminMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    colorClass: 'text-blue-600',
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    comparisonLabel: 'Live platform order volume',
    footerText: `${formatNumbers(metrics.ordersByStatus[0]?.count ?? 0)} recently updated`,
  },
  {
    label: 'Revenue This Month',
    value: formatCurrency(metrics.revenueThisMonth),
    colorClass: 'text-green-600',
    accent: 'emerald',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: 'Current billing window',
    footerText: `${formatNumbers(metrics.completedPayments)} settlements completed`,
  },
  {
    label: 'Total Revenue',
    value: formatCurrency(metrics.totalRevenue),
    colorClass: 'text-blue-700',
    accent: 'violet',
    href: '/orders',
    icon: faDollarSign,
    comparisonLabel: 'All-time collections',
    footerText: `${formatCurrency(metrics.revenueThisMonth)} booked this month`,
  },
  {
    label: 'Active Assignments',
    value: formatNumbers(metrics.activeAssignments),
    colorClass: 'text-amber-600',
    accent: 'amber',
    href: '/assignments',
    query: { status: 'ACTIVE' },
    icon: faClipboardList,
    comparisonLabel: 'Orders currently in motion',
    footerText: `${formatNumbers(metrics.totalAssignments)} total assignments`,
  },
  {
    label: 'Active Riders',
    value: formatNumbers(metrics.activeRiders),
    colorClass: 'text-purple-600',
    accent: 'violet',
    href: '/users',
    icon: faMotorcycle,
    comparisonLabel: 'Drivers available now',
    footerText: `${formatNumbers(metrics.activeAssignments)} active delivery tasks`,
  },
  {
    label: 'Total Customers',
    value: formatNumbers(metrics.totalCustomers),
    colorClass: 'text-pink-600',
    accent: 'blue',
    href: '/users',
    icon: faUsers,
    comparisonLabel: 'Customer accounts served',
    footerText: `${formatNumbers(metrics.totalOrders)} total orders fulfilled`,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
    colorClass: 'text-amber-600',
    accent: 'amber',
    href: '/orders?status=PENDING',
    icon: faClock,
    comparisonLabel: 'Awaiting settlement',
    footerText: `${formatNumbers(metrics.completedPayments)} already cleared`,
  },
  {
    label: 'Completed Payments',
    value: formatNumbers(metrics.completedPayments),
    colorClass: 'text-green-600',
    accent: 'emerald',
    href: '/orders?status=COMPLETED',
    icon: faCheckCircle,
    comparisonLabel: 'Settled payouts snapshot',
    footerText: `${formatNumbers(metrics.pendingPayments)} still pending`,
  },
];

export const getRiderMetricCards = (
  metrics: RiderMetrics
): MetricCardData[] => [
  {
    label: 'Active Assignments',
    value: formatNumbers(metrics.activeAssignments),
    colorClass: 'text-blue-600',
    accent: 'blue',
    href: '/assignments',
    query: { status: 'ACTIVE' },
    icon: faClipboardList,
    comparisonLabel: 'Deliveries currently underway',
    footerText: `${formatNumbers(metrics.pendingAssignments)} waiting to start`,
  },
  {
    label: 'Pending Assignments',
    value: formatNumbers(metrics.pendingAssignments),
    colorClass: 'text-amber-600',
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING' },
    icon: faHourglassHalf,
    comparisonLabel: 'Queue ready for pickup',
    footerText: `${formatNumbers(metrics.activeAssignments)} already in motion`,
  },
  {
    label: 'Completed Deliveries',
    value: formatNumbers(metrics.completedDeliveries),
    colorClass: 'text-green-600',
    accent: 'emerald',
    href: '/assignments',
    query: { status: 'COMPLETED' },
    icon: faCheckCircle,
    comparisonLabel: 'Completed delivery count',
    footerText: `${formatNumbers(metrics.deliveriesThisMonth)} finished this month`,
  },
  {
    label: 'Deliveries This Month',
    value: formatNumbers(metrics.deliveriesThisMonth),
    colorClass: 'text-purple-600',
    accent: 'violet',
    href: '/assignments',
    icon: faCalendarCheck,
    comparisonLabel: 'Monthly throughput',
    footerText: `${formatNumbers(metrics.completedDeliveries)} lifetime completions`,
  },
  {
    label: 'Acceptance Rate',
    value: `${formatNumbers(metrics.acceptanceRate)}%`,
    colorClass:
      metrics.acceptanceRate >= 80 ? 'text-green-600' : 'text-amber-600',
    accent: metrics.acceptanceRate >= 80 ? 'emerald' : 'amber',
    href: '/assignments',
    icon: faPercent,
    comparisonLabel: 'Assignment pickup reliability',
    footerText: `${formatNumbers(metrics.pendingAssignments)} pending decisions`,
  },
  {
    label: 'Completion Rate',
    value: `${formatNumbers(metrics.completionRate)}%`,
    colorClass:
      metrics.completionRate >= 90 ? 'text-green-600' : 'text-amber-600',
    accent: metrics.completionRate >= 90 ? 'emerald' : 'amber',
    href: '/assignments',
    icon: faCheckDouble,
    comparisonLabel: 'Successful drop-off rate',
    footerText: `${formatNumbers(metrics.activeAssignments)} active stops remaining`,
  },
];

export const getCustomerMetricCards = (
  metrics: CustomerMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    colorClass: 'text-blue-600',
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    comparisonLabel: 'All-time order requests',
    footerText: `${formatNumbers(metrics.ordersThisMonth)} placed this month`,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders),
    colorClass: 'text-amber-600',
    accent: 'amber',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
    comparisonLabel: 'Currently moving through delivery',
    footerText: `${formatNumbers(metrics.completedOrders)} already delivered`,
  },
  {
    label: 'Completed Orders',
    value: formatNumbers(metrics.completedOrders),
    colorClass: 'text-green-600',
    accent: 'emerald',
    href: '/orders',
    query: { status: 'COMPLETED,DELIVERED' },
    icon: faCheckCircle,
    comparisonLabel: 'Delivered successfully',
    footerText: `${formatNumbers(metrics.cancelledOrders)} cancelled overall`,
  },
  {
    label: 'Orders This Month',
    value: formatNumbers(metrics.ordersThisMonth),
    colorClass: 'text-purple-600',
    accent: 'violet',
    href: '/orders',
    icon: faCalendarCheck,
    comparisonLabel: 'Recent monthly demand',
    footerText: `${formatNumbers(metrics.activeOrders)} still in progress`,
  },
  {
    label: 'Cancelled Orders',
    value: formatNumbers(metrics.cancelledOrders),
    colorClass: 'text-red-500',
    accent: 'rose',
    href: '/orders',
    icon: faBan,
    comparisonLabel: 'Orders that did not complete',
    footerText: `${formatNumbers(metrics.totalOrders)} total order attempts`,
  },
  {
    label: 'Success Rate',
    value: `${formatNumbers(metrics.deliverySuccessRate)}%`,
    colorClass:
      metrics.deliverySuccessRate >= 90 ? 'text-green-600' : 'text-amber-600',
    accent: metrics.deliverySuccessRate >= 90 ? 'emerald' : 'amber',
    href: '/orders',
    icon: faPercent,
    comparisonLabel: 'Completion consistency',
    footerText: `${formatNumbers(metrics.completedOrders)} successful deliveries`,
  },
];

export const getBusinessMetricCards = (
  metrics: BusinessMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    colorClass: 'text-blue-600',
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    comparisonLabel: 'Organization-wide order volume',
    footerText: `${formatNumbers(metrics.ordersThisWeek)} this week`,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders),
    colorClass: 'text-amber-600',
    accent: 'amber',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
    comparisonLabel: 'Fulfillment currently underway',
    footerText: `${formatNumbers(metrics.completedOrders)} recently completed`,
  },
  {
    label: 'Completed Orders',
    value: formatNumbers(metrics.completedOrders),
    colorClass: 'text-green-600',
    accent: 'emerald',
    href: '/orders',
    query: { status: 'COMPLETED,DELIVERED' },
    icon: faCheckCircle,
    comparisonLabel: 'Finished deliveries',
    footerText: `${formatNumbers(metrics.pendingPayments)} payments waiting`,
  },
  {
    label: 'Monthly Volume',
    value: formatNumbers(
      Array.isArray(metrics.monthlyOrderVolume)
        ? metrics.monthlyOrderVolume.slice(-1)[0]?.value || 0
        : 0
    ),
    colorClass: 'text-purple-600',
    accent: 'violet',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: 'Latest monthly order volume',
    footerText: `${formatCurrency(metrics.averageOrderValue)} average order value`,
  },
  {
    label: 'Delivery Success Rate',
    value: `${formatNumbers(metrics.deliverySuccessRate)}%`,
    colorClass:
      metrics.deliverySuccessRate >= 90 ? 'text-green-600' : 'text-amber-600',
    accent: metrics.deliverySuccessRate >= 90 ? 'emerald' : 'amber',
    href: '/orders',
    icon: faCheckCircle,
    comparisonLabel: 'Successful fulfillment share',
    footerText: `${formatNumbers(metrics.activeOrders)} active orders today`,
  },
  {
    label: 'Team Members',
    value: formatNumbers(metrics.teamMembers),
    colorClass: 'text-indigo-600',
    accent: 'blue',
    href: '/users',
    icon: faUserGroup,
    comparisonLabel: 'Members working this account',
    footerText: `${formatNumbers(metrics.totalOrders)} orders supported`,
  },
  {
    label: 'Orders This Week',
    value: formatNumbers(metrics.ordersThisWeek),
    colorClass: 'text-cyan-600',
    accent: 'teal',
    href: '/orders',
    icon: faCalendarWeek,
    comparisonLabel: 'Short-term demand trend',
    footerText: `${formatNumbers(metrics.activeOrders)} currently open`,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
    colorClass: 'text-amber-600',
    accent: 'amber',
    href: '/orders',
    icon: faClock,
    comparisonLabel: 'Awaiting settlement',
    footerText: `${formatCurrency(metrics.averageOrderValue)} average ticket`,
  },
];

export const getDashboardStatusBreakdown = (
  role: RoleTypes | undefined,
  metrics: DashboardMetrics['metrics'] | undefined,
): DashboardStatusBreakdownItem[] => {
  if (!role || !metrics) return [];

  if (role === RoleTypes.RIDER) {
    return (metrics as RiderMetrics).assignmentsByStatus.map((item, index) => ({
      label: capitalizeString(item.status),
      value: item.count,
      tone: STATUS_TONES[index % STATUS_TONES.length],
    }));
  }

  return ((metrics as AdminMetrics | BusinessMetrics | CustomerMetrics).ordersByStatus ?? []).map(
    (item, index) => ({
      label: capitalizeString(item.status),
      value: item.count,
      tone: STATUS_TONES[index % STATUS_TONES.length],
    }),
  );
};

export const getDashboardRecentActivity = (
  metrics: DashboardMetrics['metrics'] | undefined,
): RecentActivity[] => {
  if (!metrics || !('recentActivity' in metrics)) return [];
  return [...metrics.recentActivity];
};
