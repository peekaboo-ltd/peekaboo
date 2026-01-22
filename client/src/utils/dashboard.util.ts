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
    icon: faClipboardList,
  },
  {
    label: 'Completed Deliveries',
    value: formatNumbers(metrics.completedDeliveries),
    colorClass: 'text-green-600',
    href: '/assignments',
    icon: faCheckCircle,
  },
  {
    label: 'Earnings This Month',
    value: formatCurrency(metrics.earningsThisMonth),
    colorClass: 'text-blue-700',
    href: '/assignments',
    icon: faChartLine,
  },
  {
    label: 'Total Earnings',
    value: formatCurrency(metrics.totalEarnings),
    colorClass: 'text-green-600',
    href: '/assignments',
    icon: faDollarSign,
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
    label: 'Pending Assignments',
    value: formatNumbers(metrics.pendingAssignments),
    colorClass: 'text-amber-600',
    href: '/assignments',
    icon: faHourglassHalf,
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
    icon: faShoppingCart,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders),
    colorClass: 'text-amber-600',
    href: '/orders',
    icon: faTruck,
  },
  {
    label: 'Completed Orders',
    value: formatNumbers(metrics.completedOrders),
    colorClass: 'text-green-600',
    href: '/orders',
    icon: faCheckCircle,
  },
  {
    label: 'Total Spent',
    value: formatCurrency(metrics.totalSpent),
    colorClass: 'text-blue-700',
    href: '/orders',
    icon: faDollarSign,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
    colorClass: 'text-amber-600',
    href: '/orders',
    icon: faClock,
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
    icon: faShoppingCart,
  },
  {
    label: 'Active Orders',
    value: formatNumbers(metrics.activeOrders),
    colorClass: 'text-amber-600',
    href: '/orders',
    icon: faTruck,
  },
  {
    label: 'Completed Orders',
    value: formatNumbers(metrics.completedOrders),
    colorClass: 'text-green-600',
    href: '/orders',
    icon: faCheckCircle,
  },
  {
    label: 'Monthly Volume',
    value: formatNumbers(
      Array.isArray(metrics.monthlyOrderVolume) ? metrics.monthlyOrderVolume.slice(-1)[0]?.value || 0 : 0
    ),
    colorClass: 'text-purple-600',
    href: '/orders',
    icon: faChartLine,
  },
  {
    label: 'Average Order Value',
    value: formatCurrency(metrics.averageOrderValue),
    colorClass: 'text-blue-700',
    href: '/orders',
    icon: faDollarSign,
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
    label: 'Total Spent',
    value: formatCurrency(metrics.totalSpent),
    colorClass: 'text-blue-600',
    href: '/orders',
    icon: faDollarSign,
  },
  {
    label: 'Pending Payments',
    value: formatNumbers(metrics.pendingPayments),
    colorClass: 'text-amber-600',
    href: '/orders',
    icon: faClock,
  },
];
