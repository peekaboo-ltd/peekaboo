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
  faCreditCard,
  faRocket,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { capitalizeString, formatCurrency, formatNumbers } from './strings.util';

const STATUS_TONES: DashboardAccent[] = ['blue', 'teal', 'amber', 'violet', 'rose', 'slate'];
const ARMY_BROWN_SPARK = '#4B2E2B';
const safeNumber = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;
const safeFormatNumber = (value: number | null | undefined): string =>
  formatNumbers(safeNumber(value));
const safeFormatCurrency = (value: number | null | undefined): string =>
  formatCurrency(safeNumber(value));

export const getAdminMetricCards = (
  metrics: AdminMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: safeFormatNumber(metrics.totalOrders),
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    sparkColor: ARMY_BROWN_SPARK,
    comparisonLabel: 'Live platform order volume',
    footerText: `${safeFormatNumber(metrics.ordersByStatus[0]?.count)} recently updated`,
  },
  {
    label: 'Orders This Month',
    value: safeFormatNumber(metrics.ordersThisMonth),
    accent: 'violet',
    href: '/orders',
    icon: faCalendarWeek,
    comparisonLabel: 'Current month order intake',
    footerText: `${safeFormatNumber(metrics.totalOrders)} total orders all-time`,
  },
  {
    label: 'Billing & Payments',
    value: safeFormatCurrency(metrics.billingAndPaymentsThisMonth),
    accent: 'emerald',
    href: '/billing-payments',
    icon: faCreditCard,
    comparisonLabel: 'Current billing window',
    footerText: `${safeFormatNumber(metrics.completedPayments)} completed, ${safeFormatNumber(metrics.pendingPayments)} pending`,
  },
  {
    label: 'Active Assignments',
    value: safeFormatNumber(metrics.activeAssignments),
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING', prioritizeUnassigned: 'true' },
    icon: faClipboardList,
    comparisonLabel: 'Pending orders awaiting rider assignment',
    footerText: `${safeFormatNumber(metrics.totalAssignments)} total assignments`,
  },
  {
    label: 'Business Plans',
    value: 'See Plans',
    accent: 'blue',
    to: '/services',
    icon: faRocket,
    comparisonLabel: 'Flexible plans for growing operations',
    footerText: 'Open services to compare plan options',
  },
  {
    label: 'Total Revenue',
    value: safeFormatCurrency(metrics.totalRevenue),
    accent: 'violet',
    href: '/orders',
    icon: faDollarSign,
    comparisonLabel: 'All-time collections',
    footerText: `${safeFormatCurrency(metrics.billingAndPaymentsThisMonth)} billed this month`,
  },
  {
    label: 'Active Riders',
    value: safeFormatNumber(metrics.activeRiders),
    accent: 'violet',
    href: '/users',
    icon: faMotorcycle,
    comparisonLabel: 'Drivers available now',
    footerText: `${safeFormatNumber(metrics.activeAssignments)} active delivery tasks`,
  },
  {
    label: 'Total Customers',
    value: safeFormatNumber(metrics.totalCustomers),
    accent: 'blue',
    href: '/users',
    icon: faUsers,
    comparisonLabel: 'Customer accounts served',
    footerText: `${safeFormatNumber(metrics.totalOrders)} total orders fulfilled`,
  },
  {
    label: 'Pending Assignments',
    value: safeFormatNumber(metrics.pendingStatuses),
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING' },
    icon: faClock,
    comparisonLabel: 'Assignments waiting to be handled',
    footerText: `${safeFormatNumber(metrics.totalAssignments)} total assignments`,
  },
  {
    label: 'Completed Payments',
    value: safeFormatNumber(metrics.completedPayments),
    accent: 'emerald',
    href: '/orders?status=COMPLETED',
    icon: faCheckCircle,
    comparisonLabel: 'Settled payouts snapshot',
    footerText: `${safeFormatNumber(metrics.pendingPayments)} still pending`,
  },
  {
    label: 'Organizations',
    value: safeFormatNumber(metrics.totalOrganizations),
    accent: 'violet',
    href: '/organizations',
    icon: faBuilding,
    comparisonLabel: 'Registered business accounts',
    footerText: `${safeFormatNumber(metrics.businessOrdersCount)} business orders`,
  },
  {
    label: 'Business Orders',
    value: `${safeFormatNumber(metrics.businessOrdersPercentage)}%`,
    accent: 'teal',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: 'Share of orders from businesses',
    footerText: `${safeFormatNumber(metrics.businessOrdersCount)} of ${safeFormatNumber(metrics.totalOrders)} total`,
  },
];

export const getRiderMetricCards = (
  metrics: RiderMetrics
): MetricCardData[] => [
  {
    label: 'Active Assignments',
    value: safeFormatNumber(metrics.activeAssignments),
    accent: 'blue',
    href: '/assignments',
    query: { status: 'ACTIVE' },
    icon: faClipboardList,
    comparisonLabel: 'Deliveries currently underway',
    footerText: `${safeFormatNumber(metrics.pendingAssignments)} waiting to start`,
  },
  {
    label: 'Pending Assignments',
    value: safeFormatNumber(metrics.pendingAssignments),
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING' },
    icon: faHourglassHalf,
    comparisonLabel: 'Queue ready for pickup',
    footerText: `${safeFormatNumber(metrics.activeAssignments)} already in motion`,
  },
  {
    label: 'Completed Deliveries',
    value: safeFormatNumber(metrics.completedDeliveries),
    accent: 'emerald',
    href: '/assignments',
    query: { status: 'COMPLETED' },
    icon: faCheckCircle,
    comparisonLabel: 'Completed delivery count',
    footerText: `${safeFormatNumber(metrics.deliveriesThisMonth)} finished this month`,
  },
  {
    label: 'Cancelled Assignments',
    value: safeFormatNumber(metrics.cancelledAssignments),
    accent: 'rose',
    href: '/assignments',
    query: { status: 'CANCELLED' },
    icon: faBan,
    comparisonLabel: 'Cancelled delivery tasks',
    footerText: `${safeFormatNumber(metrics.completedDeliveries)} completed deliveries`,
  },
  {
    label: 'Deliveries This Month',
    value: safeFormatNumber(metrics.deliveriesThisMonth),
    accent: 'violet',
    href: '/assignments',
    icon: faCalendarCheck,
    comparisonLabel: 'Monthly throughput',
    footerText: `${safeFormatNumber(metrics.completedDeliveries)} lifetime completions`,
  },
  {
    label: 'Acceptance Rate',
    value: `${safeFormatNumber(metrics.acceptanceRate)}%`,
    accent: metrics.acceptanceRate >= 80 ? 'emerald' : 'amber',
    href: '/assignments',
    icon: faPercent,
    comparisonLabel: 'Assignment pickup reliability',
    footerText: `${safeFormatNumber(metrics.pendingAssignments)} pending decisions`,
  },
  {
    label: 'Completion Rate',
    value: `${safeFormatNumber(metrics.completionRate)}%`,
    accent: metrics.completionRate >= 90 ? 'emerald' : 'amber',
    href: '/assignments',
    icon: faCheckDouble,
    comparisonLabel: 'Successful drop-off rate',
    footerText: `${safeFormatNumber(metrics.activeAssignments)} active stops remaining`,
  },
  {
    label: 'Total Earnings',
    value: safeFormatCurrency(metrics.totalEarnings),
    accent: 'teal',
    href: '/assignments',
    icon: faDollarSign,
    comparisonLabel: 'Lifetime delivery earnings',
    footerText: `${safeFormatCurrency(metrics.earningsThisMonth)} earned this month`,
  },
  {
    label: 'Avg Per Delivery',
    value: safeFormatCurrency(metrics.averageEarningPerDelivery),
    accent: 'blue',
    href: '/assignments',
    icon: faChartLine,
    comparisonLabel: 'Average earning per completed delivery',
    footerText: `${safeFormatNumber(metrics.completedDeliveries)} deliveries completed`,
  },
];

export const getCustomerMetricCards = (
  metrics: CustomerMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: safeFormatNumber(metrics.totalOrders),
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    sparkColor: ARMY_BROWN_SPARK,
    comparisonLabel: 'All-time order requests',
    footerText: `${safeFormatNumber(metrics.ordersThisMonth)} placed this month`,
  },
  {
    label: 'Pending Orders',
    value: safeFormatNumber(metrics.pendingOrders),
    accent: 'amber',
    href: '/orders',
    query: { status: 'PENDING' },
    icon: faHourglassHalf,
    comparisonLabel: 'Orders awaiting processing',
    footerText: `${safeFormatNumber(metrics.activeOrders)} currently active`,
  },
  {
    label: 'Active Orders',
    value: safeFormatNumber(metrics.activeOrders),
    accent: 'amber',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
    comparisonLabel: 'Currently moving through delivery',
    footerText: `${safeFormatNumber(metrics.completedOrders)} already delivered`,
  },
  {
    label: 'Completed Orders',
    value: safeFormatNumber(metrics.completedOrders),
    accent: 'emerald',
    href: '/orders',
    query: { status: 'COMPLETED,DELIVERED' },
    icon: faCheckCircle,
    comparisonLabel: 'Delivered successfully',
    footerText: `${safeFormatNumber(metrics.cancelledOrders)} cancelled overall`,
  },
  {
    label: 'Orders This Month',
    value: safeFormatNumber(metrics.ordersThisMonth),
    accent: 'violet',
    href: '/orders',
    icon: faCalendarCheck,
    comparisonLabel: 'Recent monthly demand',
    footerText: `${safeFormatNumber(metrics.activeOrders)} still in progress`,
  },
  {
    label: 'Cancelled Orders',
    value: safeFormatNumber(metrics.cancelledOrders),
    accent: 'rose',
    href: '/orders',
    icon: faBan,
    comparisonLabel: 'Orders that did not complete',
    footerText: `${safeFormatNumber(metrics.totalOrders)} total order attempts`,
  },
  {
    label: 'Success Rate',
    value: `${safeFormatNumber(metrics.deliverySuccessRate)}%`,
    accent: metrics.deliverySuccessRate >= 90 ? 'emerald' : 'amber',
    href: '/orders',
    icon: faPercent,
    comparisonLabel: 'Completion consistency',
    footerText: `${safeFormatNumber(metrics.completedOrders)} successful deliveries`,
  },
  {
    label: 'Total Spent',
    value: safeFormatCurrency(metrics.totalSpent),
    accent: 'teal',
    href: '/orders',
    icon: faDollarSign,
    comparisonLabel: 'Lifetime delivery spending',
    footerText: `${safeFormatCurrency(metrics.spendingThisMonth)} spent this month`,
  },
  {
    label: 'Avg Order Cost',
    value: safeFormatCurrency(metrics.averageOrderCost),
    accent: 'blue',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: 'Average cost per completed order',
    footerText: `${safeFormatNumber(metrics.completedOrders)} orders completed`,
  },
];

export const getBusinessMetricCards = (
  metrics: BusinessMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    sparkColor: ARMY_BROWN_SPARK,
    comparisonLabel: 'Organization-wide order volume',
    footerText: `${formatNumbers(metrics.ordersThisWeek)} this week`,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders ?? 0),
    accent: 'amber',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
    comparisonLabel: 'Fulfillment currently underway',
    footerText: `${formatNumbers(metrics.completedOrders ?? 0)} recently completed`,
  },
  {
    label: 'Billing & Payments',
    value: formatCurrency(metrics.currentAmountDue),
    accent: 'emerald',
    href: '/billing-payments',
    icon: faCreditCard,
    comparisonLabel: 'Live server-calculated amount due',
    footerText: `${formatNumbers(metrics.completedOrders)} completed orders, ${formatNumbers(metrics.pendingOrders)} pending orders`,
  },
  {
    label: 'Business Plans',
    value: 'See Plans',
    accent: 'blue',
    to: '/services',
    icon: faRocket,
    comparisonLabel: 'Flexible plans for growing operations',
    footerText: 'Open services to compare plan options',
  },
  {
    label: 'Monthly Volume',
    value: formatNumbers(
      Array.isArray(metrics.monthlyOrderVolume)
        ? metrics.monthlyOrderVolume.slice(-1)[0]?.value || 0
        : 0
    ),
    accent: 'violet',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: 'Latest monthly order volume',
    footerText: `${formatCurrency(metrics.averageOrderValue)} average order value`,
  },
  {
    label: 'Delivery Success Rate',
    value: `${formatNumbers(metrics.deliverySuccessRate)}%`,
    accent: metrics.deliverySuccessRate >= 90 ? 'emerald' : 'amber',
    href: '/orders',
    icon: faCheckCircle,
    comparisonLabel: 'Successful fulfillment share',
    footerText: `${formatNumbers(metrics.activeOrders)} active orders today`,
  },
  {
    label: 'Team Members',
    value: formatNumbers(metrics.teamMembers),
    accent: 'blue',
    href: '/users',
    icon: faUserGroup,
    comparisonLabel: 'Members working this account',
    footerText: `${formatNumbers(metrics.totalOrders)} orders supported`,
  },
  {
    label: 'Orders This Week',
    value: formatNumbers(metrics.ordersThisWeek),
    accent: 'teal',
    href: '/orders',
    icon: faCalendarWeek,
    comparisonLabel: 'Short-term demand trend',
    footerText: `${formatNumbers(metrics.activeOrders)} currently open`,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
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
