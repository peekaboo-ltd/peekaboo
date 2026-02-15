import {
  AdminMetrics,
  RiderMetrics,
  CustomerMetrics,
  BusinessMetrics,
  MetricCardData,
} from '@/types/dashboard.type';
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
import { formatCurrency, formatNumbers } from './strings.util';

export const getAdminMetricCards = (
  metrics: AdminMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    colorClass: 'text-blue-600',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
  },
  {
    label: 'Revenue This Month',
    value: formatCurrency(metrics.revenueThisMonth),
    colorClass: 'text-green-600',
    href: '/orders',
    icon: faChartLine,
  },
  {
    label: 'Total Revenue',
    value: formatCurrency(metrics.totalRevenue),
    colorClass: 'text-blue-700',
    href: '/orders',
    icon: faDollarSign,
  },
  {
    label: 'Active Assignments',
    value: formatNumbers(metrics.activeAssignments),
    colorClass: 'text-amber-600',
    href: '/assignments',
    query: { status: 'ACTIVE' },
    icon: faClipboardList,
  },
  {
    label: 'Active Riders',
    value: formatNumbers(metrics.activeRiders),
    colorClass: 'text-purple-600',
    href: '/users',
    icon: faMotorcycle,
  },
  {
    label: 'Total Customers',
    value: formatNumbers(metrics.totalCustomers),
    colorClass: 'text-pink-600',
    href: '/users',
    icon: faUsers,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
    colorClass: 'text-amber-600',
    href: '/orders',
    icon: faClock,
  },
  {
    label: 'Completed Payments',
    value: formatNumbers(metrics.completedPayments),
    colorClass: 'text-green-600',
    href: '/orders',
    icon: faCheckCircle,
  },
];

export const getRiderMetricCards = (
  metrics: RiderMetrics
): MetricCardData[] => [
  {
    label: 'Active Assignments',
    value: formatNumbers(metrics.activeAssignments),
    colorClass: 'text-blue-600',
    href: '/assignments',
    query: { status: 'ACTIVE' },
    icon: faClipboardList,
  },
  {
    label: 'Pending Assignments',
    value: formatNumbers(metrics.pendingAssignments),
    colorClass: 'text-amber-600',
    href: '/assignments',
    query: { status: 'PENDING' },
    icon: faHourglassHalf,
  },
  {
    label: 'Completed Deliveries',
    value: formatNumbers(metrics.completedDeliveries),
    colorClass: 'text-green-600',
    href: '/assignments',
    query: { status: 'COMPLETED' },
    icon: faCheckCircle,
  },
  {
    label: 'Deliveries This Month',
    value: formatNumbers(metrics.deliveriesThisMonth),
    colorClass: 'text-purple-600',
    href: '/assignments',
    icon: faCalendarCheck,
  },
  {
    label: 'Acceptance Rate',
    value: `${formatNumbers(metrics.acceptanceRate)}%`,
    colorClass:
      metrics.acceptanceRate >= 80 ? 'text-green-600' : 'text-amber-600',
    href: '/assignments',
    icon: faPercent,
  },
  {
    label: 'Completion Rate',
    value: `${formatNumbers(metrics.completionRate)}%`,
    colorClass:
      metrics.completionRate >= 90 ? 'text-green-600' : 'text-amber-600',
    href: '/assignments',
    icon: faCheckDouble,
  },
];

export const getCustomerMetricCards = (
  metrics: CustomerMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    colorClass: 'text-blue-600',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders),
    colorClass: 'text-amber-600',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
  },
  {
    label: 'Completed Orders',
    value: formatNumbers(metrics.completedOrders),
    colorClass: 'text-green-600',
    href: '/orders',
    query: { status: 'COMPLETED,DELIVERED' },
    icon: faCheckCircle,
  },
  {
    label: 'Orders This Month',
    value: formatNumbers(metrics.ordersThisMonth),
    colorClass: 'text-purple-600',
    href: '/orders',
    icon: faCalendarCheck,
  },
  {
    label: 'Cancelled Orders',
    value: formatNumbers(metrics.cancelledOrders),
    colorClass: 'text-red-500',
    href: '/orders',
    icon: faBan,
  },
  {
    label: 'Success Rate',
    value: `${formatNumbers(metrics.deliverySuccessRate)}%`,
    colorClass:
      metrics.deliverySuccessRate >= 90 ? 'text-green-600' : 'text-amber-600',
    href: '/orders',
    icon: faPercent,
  },
];

export const getBusinessMetricCards = (
  metrics: BusinessMetrics
): MetricCardData[] => [
  {
    label: 'Total Orders',
    value: formatNumbers(metrics.totalOrders),
    colorClass: 'text-blue-600',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders),
    colorClass: 'text-amber-600',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
  },
  {
    label: 'Completed Orders',
    value: formatNumbers(metrics.completedOrders),
    colorClass: 'text-green-600',
    href: '/orders',
    query: { status: 'COMPLETED,DELIVERED' },
    icon: faCheckCircle,
  },
  {
    label: 'Monthly Volume',
    value: formatNumbers(
      Array.isArray(metrics.monthlyOrderVolume)
        ? metrics.monthlyOrderVolume.slice(-1)[0]?.value || 0
        : 0
    ),
    colorClass: 'text-purple-600',
    href: '/orders',
    icon: faChartLine,
  },
  {
    label: 'Delivery Success Rate',
    value: `${formatNumbers(metrics.deliverySuccessRate)}%`,
    colorClass:
      metrics.deliverySuccessRate >= 90 ? 'text-green-600' : 'text-amber-600',
    href: '/orders',
    icon: faCheckCircle,
  },
  {
    label: 'Team Members',
    value: formatNumbers(metrics.teamMembers),
    colorClass: 'text-indigo-600',
    href: '/users',
    icon: faUserGroup,
  },
  {
    label: 'Orders This Week',
    value: formatNumbers(metrics.ordersThisWeek),
    colorClass: 'text-cyan-600',
    href: '/orders',
    icon: faCalendarWeek,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
    colorClass: 'text-amber-600',
    href: '/orders',
    icon: faClock,
  },
];
