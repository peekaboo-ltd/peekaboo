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
import { formatCurrency, formatNumbers } from './strings.util';
import type { I18nContextValue } from '@/i18n/i18n';

type Translate = I18nContextValue['t'];

const STATUS_TONES: DashboardAccent[] = ['blue', 'teal', 'amber', 'violet', 'rose', 'slate'];
const ARMY_BROWN_SPARK = '#4B2E2B';
const safeNumber = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;
const safeFormatNumber = (value: number | null | undefined): string =>
  formatNumbers(safeNumber(value));
const safeFormatCurrency = (value: number | null | undefined): string =>
  formatCurrency(safeNumber(value));

export const getAdminMetricCards = (
  metrics: AdminMetrics,
  t: Translate,
): MetricCardData[] => [
  {
    label: t('dashboard.metric.totalOrders'),
    value: safeFormatNumber(metrics.totalOrders),
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    sparkColor: ARMY_BROWN_SPARK,
    comparisonLabel: t('dashboard.compare.liveOrders'),
    footerText: t('dashboard.footer.recentlyUpdated', { count: safeFormatNumber(metrics.ordersByStatus[0]?.count) }),
  },
  {
    label: t('dashboard.metric.ordersThisMonth'),
    value: safeFormatNumber(metrics.ordersThisMonth),
    accent: 'violet',
    href: '/orders',
    icon: faCalendarWeek,
    comparisonLabel: t('dashboard.compare.monthOrders'),
    footerText: t('dashboard.footer.totalAllTime', { count: safeFormatNumber(metrics.totalOrders) }),
  },
  {
    label: t('dashboard.metric.billingPayments'),
    value: safeFormatCurrency(metrics.billingAndPaymentsThisMonth),
    accent: 'emerald',
    href: '/billing-payments',
    icon: faCreditCard,
    comparisonLabel: t('dashboard.compare.billingWindow'),
    footerText: t('dashboard.footer.paymentCounts', { completed: safeFormatNumber(metrics.completedPayments), pending: safeFormatNumber(metrics.pendingPayments) }),
  },
  {
    label: t('dashboard.metric.activeAssignments'),
    value: safeFormatNumber(metrics.activeAssignments),
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING', prioritizeUnassigned: 'true' },
    icon: faClipboardList,
    comparisonLabel: t('dashboard.compare.awaitingRider'),
    footerText: t('dashboard.footer.totalAssignments', { count: safeFormatNumber(metrics.totalAssignments) }),
  },
  {
    label: t('dashboard.metric.businessPlans'),
    value: t('dashboard.metric.seePlans'),
    accent: 'blue',
    to: '/services',
    icon: faRocket,
    comparisonLabel: t('dashboard.compare.flexiblePlans'),
    footerText: t('dashboard.footer.openServices'),
  },
  {
    label: t('dashboard.metric.totalRevenue'),
    value: safeFormatCurrency(metrics.totalRevenue),
    accent: 'violet',
    href: '/orders',
    icon: faDollarSign,
    comparisonLabel: t('dashboard.compare.allCollections'),
    footerText: t('dashboard.footer.billedMonth', { amount: safeFormatCurrency(metrics.billingAndPaymentsThisMonth) }),
  },
  {
    label: t('dashboard.metric.activeRiders'),
    value: safeFormatNumber(metrics.activeRiders),
    accent: 'violet',
    href: '/users',
    icon: faMotorcycle,
    comparisonLabel: t('dashboard.compare.ridersAvailable'),
    footerText: t('dashboard.footer.activeTasks', { count: safeFormatNumber(metrics.activeAssignments) }),
  },
  {
    label: t('dashboard.metric.totalCustomers'),
    value: safeFormatNumber(metrics.totalCustomers),
    accent: 'blue',
    href: '/users',
    icon: faUsers,
    comparisonLabel: t('dashboard.compare.customersServed'),
    footerText: t('dashboard.footer.ordersFulfilled', { count: safeFormatNumber(metrics.totalOrders) }),
  },
  {
    label: t('dashboard.metric.pendingAssignments'),
    value: safeFormatNumber(metrics.pendingStatuses),
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING' },
    icon: faClock,
    comparisonLabel: t('dashboard.compare.assignmentsWaiting'),
    footerText: t('dashboard.footer.totalAssignments', { count: safeFormatNumber(metrics.totalAssignments) }),
  },
  {
    label: t('dashboard.metric.completedPayments'),
    value: safeFormatNumber(metrics.completedPayments),
    accent: 'emerald',
    href: '/orders?status=COMPLETED',
    icon: faCheckCircle,
    comparisonLabel: t('dashboard.compare.settledPayments'),
    footerText: t('dashboard.footer.stillPending', { count: safeFormatNumber(metrics.pendingPayments) }),
  },
  {
    label: t('dashboard.metric.organizations'),
    value: safeFormatNumber(metrics.totalOrganizations),
    accent: 'violet',
    href: '/organizations',
    icon: faBuilding,
    comparisonLabel: t('dashboard.compare.registeredBusinesses'),
    footerText: t('dashboard.footer.businessOrders', { count: safeFormatNumber(metrics.businessOrdersCount) }),
  },
  {
    label: t('dashboard.metric.businessOrders'),
    value: `${safeFormatNumber(metrics.businessOrdersPercentage)}%`,
    accent: 'teal',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: t('dashboard.compare.businessShare'),
    footerText: t('dashboard.footer.businessOfTotal', { business: safeFormatNumber(metrics.businessOrdersCount), total: safeFormatNumber(metrics.totalOrders) }),
  },
];

export const getRiderMetricCards = (
  metrics: RiderMetrics,
  t: Translate,
): MetricCardData[] => [
  {
    label: t('dashboard.metric.activeAssignments'),
    value: safeFormatNumber(metrics.activeAssignments),
    accent: 'blue',
    href: '/assignments',
    query: { status: 'ACTIVE' },
    icon: faClipboardList,
    comparisonLabel: t('dashboard.compare.underway'),
    footerText: t('dashboard.footer.waitingStart', { count: safeFormatNumber(metrics.pendingAssignments) }),
  },
  {
    label: t('dashboard.metric.pendingAssignments'),
    value: safeFormatNumber(metrics.pendingAssignments),
    accent: 'amber',
    href: '/assignments',
    query: { status: 'PENDING' },
    icon: faHourglassHalf,
    comparisonLabel: t('dashboard.compare.pickupQueue'),
    footerText: t('dashboard.footer.inMotion', { count: safeFormatNumber(metrics.activeAssignments) }),
  },
  {
    label: t('dashboard.metric.completedDeliveries'),
    value: safeFormatNumber(metrics.completedDeliveries),
    accent: 'emerald',
    href: '/assignments',
    query: { status: 'COMPLETED' },
    icon: faCheckCircle,
    comparisonLabel: t('dashboard.compare.completedCount'),
    footerText: t('dashboard.footer.finishedMonth', { count: safeFormatNumber(metrics.deliveriesThisMonth) }),
  },
  {
    label: t('dashboard.metric.cancelledAssignments'),
    value: safeFormatNumber(metrics.cancelledAssignments),
    accent: 'rose',
    href: '/assignments',
    query: { status: 'CANCELLED' },
    icon: faBan,
    comparisonLabel: t('dashboard.compare.cancelledTasks'),
    footerText: t('dashboard.footer.completedDeliveries', { count: safeFormatNumber(metrics.completedDeliveries) }),
  },
  {
    label: t('dashboard.metric.deliveriesThisMonth'),
    value: safeFormatNumber(metrics.deliveriesThisMonth),
    accent: 'violet',
    href: '/assignments',
    icon: faCalendarCheck,
    comparisonLabel: t('dashboard.compare.monthlyThroughput'),
    footerText: t('dashboard.footer.lifetimeCompletions', { count: safeFormatNumber(metrics.completedDeliveries) }),
  },
  {
    label: t('dashboard.metric.acceptanceRate'),
    value: `${safeFormatNumber(metrics.acceptanceRate)}%`,
    accent: metrics.acceptanceRate >= 80 ? 'emerald' : 'amber',
    href: '/assignments',
    icon: faPercent,
    comparisonLabel: t('dashboard.compare.acceptanceReliability'),
    footerText: t('dashboard.footer.pendingDecisions', { count: safeFormatNumber(metrics.pendingAssignments) }),
  },
  {
    label: t('dashboard.metric.completionRate'),
    value: `${safeFormatNumber(metrics.completionRate)}%`,
    accent: metrics.completionRate >= 90 ? 'emerald' : 'amber',
    href: '/assignments',
    icon: faCheckDouble,
    comparisonLabel: t('dashboard.compare.dropoffRate'),
    footerText: t('dashboard.footer.activeStops', { count: safeFormatNumber(metrics.activeAssignments) }),
  },
  {
    label: t('dashboard.metric.totalEarnings'),
    value: safeFormatCurrency(metrics.totalEarnings),
    accent: 'teal',
    href: '/assignments',
    icon: faDollarSign,
    comparisonLabel: t('dashboard.compare.lifetimeEarnings'),
    footerText: t('dashboard.footer.earnedMonth', { amount: safeFormatCurrency(metrics.earningsThisMonth) }),
  },
  {
    label: t('dashboard.metric.averagePerDelivery'),
    value: safeFormatCurrency(metrics.averageEarningPerDelivery),
    accent: 'blue',
    href: '/assignments',
    icon: faChartLine,
    comparisonLabel: t('dashboard.compare.averageEarning'),
    footerText: t('dashboard.footer.deliveriesCompleted', { count: safeFormatNumber(metrics.completedDeliveries) }),
  },
];

export const getCustomerMetricCards = (
  metrics: CustomerMetrics,
  t: Translate,
): MetricCardData[] => [
  {
    label: t('dashboard.metric.totalOrders'),
    value: safeFormatNumber(metrics.totalOrders),
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    sparkColor: ARMY_BROWN_SPARK,
    comparisonLabel: t('dashboard.compare.allRequests'),
    footerText: t('dashboard.footer.placedMonth', { count: safeFormatNumber(metrics.ordersThisMonth) }),
  },
  {
    label: t('dashboard.metric.pendingOrders'),
    value: safeFormatNumber(metrics.pendingOrders),
    accent: 'amber',
    href: '/orders',
    query: { status: 'PENDING' },
    icon: faHourglassHalf,
    comparisonLabel: t('dashboard.compare.awaitingProcessing'),
    footerText: t('dashboard.footer.currentlyActive', { count: safeFormatNumber(metrics.activeOrders) }),
  },
  {
    label: t('dashboard.metric.activeOrders'),
    value: safeFormatNumber(metrics.activeOrders),
    accent: 'amber',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
    comparisonLabel: t('dashboard.compare.moving'),
    footerText: t('dashboard.footer.alreadyDelivered', { count: safeFormatNumber(metrics.completedOrders) }),
  },
  {
    label: t('dashboard.metric.completedOrders'),
    value: safeFormatNumber(metrics.completedOrders),
    accent: 'emerald',
    href: '/orders',
    query: { status: 'COMPLETED,DELIVERED' },
    icon: faCheckCircle,
    comparisonLabel: t('dashboard.compare.delivered'),
    footerText: t('dashboard.footer.cancelledOverall', { count: safeFormatNumber(metrics.cancelledOrders) }),
  },
  {
    label: t('dashboard.metric.ordersThisMonth'),
    value: safeFormatNumber(metrics.ordersThisMonth),
    accent: 'violet',
    href: '/orders',
    icon: faCalendarCheck,
    comparisonLabel: t('dashboard.compare.monthlyDemand'),
    footerText: t('dashboard.footer.inProgress', { count: safeFormatNumber(metrics.activeOrders) }),
  },
  {
    label: t('dashboard.metric.cancelledOrders'),
    value: safeFormatNumber(metrics.cancelledOrders),
    accent: 'rose',
    href: '/orders',
    icon: faBan,
    comparisonLabel: t('dashboard.compare.notCompleted'),
    footerText: t('dashboard.footer.orderAttempts', { count: safeFormatNumber(metrics.totalOrders) }),
  },
  {
    label: t('dashboard.metric.successRate'),
    value: `${safeFormatNumber(metrics.deliverySuccessRate)}%`,
    accent: metrics.deliverySuccessRate >= 90 ? 'emerald' : 'amber',
    href: '/orders',
    icon: faPercent,
    comparisonLabel: t('dashboard.compare.consistency'),
    footerText: t('dashboard.footer.successfulDeliveries', { count: safeFormatNumber(metrics.completedOrders) }),
  },
  {
    label: t('dashboard.metric.totalSpent'),
    value: safeFormatCurrency(metrics.totalSpent),
    accent: 'teal',
    href: '/orders',
    icon: faDollarSign,
    comparisonLabel: t('dashboard.compare.lifetimeSpending'),
    footerText: t('dashboard.footer.spentMonth', { amount: safeFormatCurrency(metrics.spendingThisMonth) }),
  },
  {
    label: t('dashboard.metric.averageOrderCost'),
    value: safeFormatCurrency(metrics.averageOrderCost),
    accent: 'blue',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: t('dashboard.compare.averageCost'),
    footerText: t('dashboard.footer.ordersCompleted', { count: safeFormatNumber(metrics.completedOrders) }),
  },
];

export const getBusinessMetricCards = (
  metrics: BusinessMetrics,
  t: Translate,
): MetricCardData[] => [
  {
    label: t('dashboard.metric.totalOrders'),
    value: formatNumbers(metrics.totalOrders),
    accent: 'blue',
    href: '/orders',
    query: { statusGroup: 'recent' },
    icon: faShoppingCart,
    sparkColor: ARMY_BROWN_SPARK,
    comparisonLabel: t('dashboard.compare.organizationVolume'),
    footerText: t('dashboard.footer.thisWeek', { count: formatNumbers(metrics.ordersThisWeek) }),
  },
  {
    label: t('dashboard.metric.activeOrders'),
    value: formatNumbers(metrics.activeOrders ?? 0),
    accent: 'amber',
    href: '/orders',
    query: { status: 'IN_TRANSIT,ACCEPTED,CONFIRMED' },
    icon: faTruck,
    comparisonLabel: t('dashboard.compare.fulfillmentUnderway'),
    footerText: t('dashboard.footer.recentlyCompleted', { count: formatNumbers(metrics.completedOrders ?? 0) }),
  },
  {
    label: t('dashboard.metric.billingPayments'),
    value: formatCurrency(metrics.currentAmountDue),
    accent: 'emerald',
    href: '/billing-payments',
    icon: faCreditCard,
    comparisonLabel: t('dashboard.compare.amountDue'),
    footerText: t('dashboard.footer.orderPaymentCounts', { completed: formatNumbers(metrics.completedOrders), pending: formatNumbers(metrics.pendingOrders) }),
  },
  {
    label: t('dashboard.metric.businessPlans'),
    value: t('dashboard.metric.seePlans'),
    accent: 'blue',
    to: '/services',
    icon: faRocket,
    comparisonLabel: t('dashboard.compare.flexiblePlans'),
    footerText: t('dashboard.footer.openServices'),
  },
  {
    label: t('dashboard.metric.monthlyVolume'),
    value: formatNumbers(
      Array.isArray(metrics.monthlyOrderVolume)
        ? metrics.monthlyOrderVolume.slice(-1)[0]?.value || 0
        : 0
    ),
    accent: 'violet',
    href: '/orders',
    icon: faChartLine,
    comparisonLabel: t('dashboard.compare.latestMonthly'),
    footerText: t('dashboard.footer.averageOrderValue', { amount: formatCurrency(metrics.averageOrderValue) }),
  },
  {
    label: t('dashboard.metric.deliverySuccessRate'),
    value: `${formatNumbers(metrics.deliverySuccessRate)}%`,
    accent: metrics.deliverySuccessRate >= 90 ? 'emerald' : 'amber',
    href: '/orders',
    icon: faCheckCircle,
    comparisonLabel: t('dashboard.compare.fulfillmentShare'),
    footerText: t('dashboard.footer.activeToday', { count: formatNumbers(metrics.activeOrders) }),
  },
  {
    label: t('dashboard.metric.teamMembers'),
    value: formatNumbers(metrics.teamMembers),
    accent: 'blue',
    href: '/users',
    icon: faUserGroup,
    comparisonLabel: t('dashboard.compare.accountMembers'),
    footerText: t('dashboard.footer.ordersSupported', { count: formatNumbers(metrics.totalOrders) }),
  },
  {
    label: t('dashboard.metric.ordersThisWeek'),
    value: formatNumbers(metrics.ordersThisWeek),
    accent: 'teal',
    href: '/orders',
    icon: faCalendarWeek,
    comparisonLabel: t('dashboard.compare.shortTrend'),
    footerText: t('dashboard.footer.currentlyOpen', { count: formatNumbers(metrics.activeOrders) }),
  },
  {
    label: t('dashboard.metric.pendingPayments'),
    value: formatNumbers(metrics.pendingPayments),
    accent: 'amber',
    href: '/orders',
    icon: faClock,
    comparisonLabel: t('dashboard.compare.awaitingSettlement'),
    footerText: t('dashboard.footer.averageTicket', { amount: formatCurrency(metrics.averageOrderValue) }),
  },
];

export const getDashboardStatusBreakdown = (
  role: RoleTypes | undefined,
  metrics: DashboardMetrics['metrics'] | undefined,
  t: Translate,
): DashboardStatusBreakdownItem[] => {
  if (!role || !metrics) return [];

  if (role === RoleTypes.RIDER) {
    return (metrics as RiderMetrics).assignmentsByStatus.map((item, index) => ({
      label: t(`status.${item.status.toLowerCase()}`),
      value: item.count,
      tone: STATUS_TONES[index % STATUS_TONES.length],
    }));
  }

  return ((metrics as AdminMetrics | BusinessMetrics | CustomerMetrics).ordersByStatus ?? []).map(
    (item, index) => ({
      label: t(`status.${item.status.toLowerCase()}`),
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
