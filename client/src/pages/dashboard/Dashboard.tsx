import { useEffect, useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useAppSelector } from '@/states/hooks';
import {
  useGetDashboardMetricsQuery,
  useGetOrderChartDataQuery,
  useGetRevenueChartDataQuery,
  useGetDeliveryChartDataQuery,
  useGetSummaryChartDataQuery,
} from '@/api/queries/dashboard.queries';
import { RoleTypes } from '@/types/auth.type';
import type {
  AdminMetrics,
  BusinessMetrics,
  CustomerMetrics,
  RiderMetrics,
  MetricCardData,
  ChartDataPoint,
  DashboardActionLink,
  DashboardSupportCardData,
} from '@/types/dashboard.type';
import {
  getAdminMetricCards,
  getBusinessMetricCards,
  getCustomerMetricCards,
  getDashboardRecentActivity,
  getDashboardStatusBreakdown,
  getRiderMetricCards,
} from '@/utils/dashboard.util';
import {
  faShoppingCart,
  faClipboardList,
  faUsers,
  faUserGroup,
  faPlus,
  faMotorcycle,
  faCreditCard,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import DashboardHeader from './components/DashboardHeader';
import DashboardMetricsSection from './components/DashboardMetricsSection';
import DashboardSummaryChart from './components/DashboardSummaryChart';
import DashboardLoading from './components/DashboardLoading';
import DashboardError from './components/DashboardError';
import DashboardActivityPanel from './components/DashboardActivityPanel';
import DashboardContextPanel from './components/DashboardContextPanel';
import type { DispatchStripItem } from './components/DashboardDispatchStrip';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { formatCurrency, formatNumbers } from '@/utils/strings.util';
import { useI18n, type I18nContextValue } from '@/i18n/i18n';

type Translate = I18nContextValue['t'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 1, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 1, 1] },
  },
};

const metricDefaultsByRole: Record<RoleTypes, string> = {
  [RoleTypes.ADMIN]: 'ORDERS',
  [RoleTypes.STAFF]: 'ORDERS',
  [RoleTypes.BUSINESS]: 'ORDERS',
  [RoleTypes.RIDER]: 'DELIVERIES',
  [RoleTypes.CUSTOMER]: 'ORDERS',
  [RoleTypes.GUEST]: 'ORDERS',
};

const getAverage = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const calculateTrendFromSeries = (series: number[]) => {
  if (series.length < 2) return undefined;

  const midpoint = Math.floor(series.length / 2);
  const previousWindow = series.slice(0, Math.max(1, midpoint));
  const currentWindow = series.slice(Math.max(1, midpoint));

  const previousAvg = getAverage(previousWindow);
  const currentAvg = getAverage(currentWindow);

  if (previousAvg <= 0) {
    if (currentAvg <= 0) {
      return { value: 0, isPositive: true };
    }
    return { value: 100, isPositive: true };
  }

  const delta = ((currentAvg - previousAvg) / previousAvg) * 100;
  return {
    value: Math.min(999, Math.round(Math.abs(delta))),
    isPositive: delta >= 0,
  };
};

const selectSeriesForCard = ({
  cardLabel,
  role,
  ordersSeries,
  revenueSeries,
  deliveriesSeries,
  t,
}: {
  cardLabel: string;
  role?: RoleTypes;
  ordersSeries: number[];
  revenueSeries: number[];
  deliveriesSeries: number[];
  t: Translate;
}) => {
  if (role === RoleTypes.RIDER) {
    return deliveriesSeries.length ? deliveriesSeries : ordersSeries;
  }

  if ([t('dashboard.metric.billingPayments'), t('dashboard.metric.totalRevenue'), t('dashboard.metric.totalEarnings'), t('dashboard.metric.totalSpent'), t('dashboard.metric.pendingPayments')].includes(cardLabel)) {
    return revenueSeries.length ? revenueSeries : ordersSeries;
  }

  if ([t('dashboard.metric.activeAssignments'), t('dashboard.metric.pendingAssignments'), t('dashboard.metric.cancelledAssignments'), t('dashboard.metric.completedDeliveries'), t('dashboard.metric.deliveriesThisMonth'), t('dashboard.metric.deliverySuccessRate')].includes(cardLabel)) {
    return deliveriesSeries.length ? deliveriesSeries : ordersSeries;
  }

  return ordersSeries;
};

const buildMetricCards = (
  role: RoleTypes | undefined,
  metrics: AdminMetrics | BusinessMetrics | RiderMetrics | CustomerMetrics | undefined,
  seriesByCategory: {
    orders: number[];
    revenue: number[];
    deliveries: number[];
  },
  t: Translate,
): MetricCardData[] => {
  if (!role || !metrics) return [];
  const isAdminMetrics = (value: typeof metrics): value is AdminMetrics =>
    'totalCustomers' in value && 'activeRiders' in value;
  const isBusinessMetrics = (value: typeof metrics): value is BusinessMetrics =>
    'teamMembers' in value && 'currentAmountDue' in value;
  const isRiderMetrics = (value: typeof metrics): value is RiderMetrics =>
    'assignmentsByStatus' in value && 'acceptanceRate' in value;
  const isCustomerMetrics = (value: typeof metrics): value is CustomerMetrics =>
    'deliverySuccessRate' in value && 'pendingOrders' in value && !('teamMembers' in value);

  let baseCards: MetricCardData[] = [];

  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      baseCards = isAdminMetrics(metrics) ? getAdminMetricCards(metrics, t) : [];
      break;
    case RoleTypes.BUSINESS:
      baseCards = isBusinessMetrics(metrics) ? getBusinessMetricCards(metrics, t) : [];
      break;
    case RoleTypes.RIDER:
      baseCards = isRiderMetrics(metrics) ? getRiderMetricCards(metrics, t) : [];
      break;
    case RoleTypes.CUSTOMER:
    default:
      baseCards = isCustomerMetrics(metrics) ? getCustomerMetricCards(metrics, t) : [];
      break;
  }

  return baseCards.map((card, index) => {
    const selectedSeries = selectSeriesForCard({
      cardLabel: card.label,
      role,
      ordersSeries: seriesByCategory.orders,
      revenueSeries: seriesByCategory.revenue,
      deliveriesSeries: seriesByCategory.deliveries,
      t,
    });
    const trend = card.trend ?? calculateTrendFromSeries(selectedSeries);

    return {
      ...card,
      sparklineData: card.sparklineData ?? selectedSeries,
      sparklineType: card.sparklineType ?? (index % 2 === 0 ? 'line' : 'bar'),
      trend,
    };
  });
};

const normalizeChartData = (
  payload?: Array<{ label?: string; name?: string; value?: number | string }>,
): ChartDataPoint[] => {
  if (!payload?.length) return [];
  return payload
    .map((point, index) => {
      const name = point.label ?? point.name ?? `P${index + 1}`;
      const value = Number(point.value ?? 0);
      return { name, value: Number.isFinite(value) ? value : 0 };
    })
    .filter((point) => point.name);
};

const getQuickActionsForRole = (role: RoleTypes | undefined, t: Translate): DashboardActionLink[] => {
  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      return [
        { label: t('dashboard.action.newOrder'), to: '/orders', icon: faPlus },
        { label: t('dashboard.action.orders'), to: '/orders', icon: faShoppingCart },
        { label: t('dashboard.action.assignments'), to: '/assignments', icon: faClipboardList },
        { label: t('dashboard.metric.billingPayments'), to: '/billing-payments', icon: faCreditCard },
        { label: t('dashboard.action.users'), to: '/users', icon: faUsers },
      ];
    case RoleTypes.BUSINESS:
      return [
        { label: t('dashboard.action.newOrder'), to: '/orders', icon: faPlus },
        { label: t('dashboard.action.myOrders'), to: '/orders', icon: faShoppingCart },
        { label: t('dashboard.metric.billingPayments'), to: '/billing-payments', icon: faCreditCard },
        { label: t('dashboard.action.requestReport'), to: '/billing-payments', icon: faFileLines },
        { label: t('dashboard.action.team'), to: '/users', icon: faUserGroup },
      ];
    case RoleTypes.RIDER:
      return [
        { label: t('dashboard.action.assignments'), to: '/assignments', icon: faClipboardList },
        { label: t('dashboard.action.myDeliveries'), to: '/assignments', icon: faMotorcycle },
      ];
    case RoleTypes.CUSTOMER:
    default:
      return [
        { label: t('dashboard.action.newOrder'), to: '/orders', icon: faPlus },
        { label: t('dashboard.action.myOrders'), to: '/orders', icon: faShoppingCart },
      ];
  }
};

const getWidgetSummary = (data: ChartDataPoint[], t: Translate, prefix?: 'currency') => {
  if (!data.length) {
    return t('dashboard.noData');
  }

  const total = data.reduce((sum, point) => sum + point.value, 0);
  return prefix === 'currency' ? formatCurrency(total) : formatNumbers(total);
};

const buildSupportWidgets = (
  role: RoleTypes | undefined,
  ordersData: ChartDataPoint[],
  revenueData: ChartDataPoint[],
  deliveriesData: ChartDataPoint[],
  statusBreakdown: ReturnType<typeof getDashboardStatusBreakdown>,
  t: Translate,
): DashboardSupportCardData[] => {
  const primarySeries =
    role === RoleTypes.RIDER
      ? deliveriesData
      : role === RoleTypes.ADMIN || role === RoleTypes.STAFF
        ? revenueData
        : ordersData;

  return [
    {
      title:
        role === RoleTypes.RIDER
          ? t('dashboard.deliveryCadence')
          : role === RoleTypes.ADMIN || role === RoleTypes.STAFF
            ? t('dashboard.revenuePulse')
            : t('dashboard.orderCadence'),
      value:
        role === RoleTypes.ADMIN || role === RoleTypes.STAFF
          ? getWidgetSummary(primarySeries, t, 'currency')
          : getWidgetSummary(primarySeries, t),
      subtitle:
        role === RoleTypes.RIDER
          ? t('dashboard.deliveryTrendSubtitle')
          : t('dashboard.trendSubtitle'),
      chartType: role === RoleTypes.ADMIN || role === RoleTypes.STAFF ? 'line' : 'bar',
      accent: role === RoleTypes.ADMIN || role === RoleTypes.STAFF ? 'teal' : 'blue',
      data: primarySeries,
    },
    {
      title: role === RoleTypes.RIDER ? t('dashboard.assignmentMix') : t('dashboard.statusMix'),
      value: formatNumbers(statusBreakdown.reduce((sum, item) => sum + item.value, 0)),
      subtitle: t('dashboard.statusDistribution'),
      chartType: 'status',
      accent: 'blue',
      breakdown: statusBreakdown.slice(0, 4),
    },
  ];
};


const formatDateParam = (date?: Date) => {
  if (!date) return undefined;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

const getContextCopy = (role: RoleTypes | undefined, t: Translate) => {
  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      return {
        title: t('dashboard.context.operationalTitle'),
        description: t('dashboard.context.operationalDescription'),
      };
    case RoleTypes.BUSINESS:
      return {
        title: t('dashboard.context.businessTitle'),
        description: t('dashboard.context.businessDescription'),
      };
    case RoleTypes.RIDER:
      return {
        title: t('dashboard.context.riderTitle'),
        description: t('dashboard.context.riderDescription'),
      };
    case RoleTypes.CUSTOMER:
    default:
      return {
        title: t('dashboard.context.customerTitle'),
        description: t('dashboard.context.customerDescription'),
      };
  }
};

const getDispatchStatus = (label: string): DispatchStripItem['status'] => {
  const normalized = label.toLowerCase();
  if (
    normalized.includes('cancel') ||
    normalized.includes('outage') ||
    normalized.includes('failed') ||
    normalized.includes('reject')
  ) {
    return 'down';
  }
  if (normalized.includes('pending') || normalized.includes('hold') || normalized.includes('review')) {
    return 'watch';
  }
  return 'up';
};

const Dashboard = () => {
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metric, setMetric] = useState<string>('ORDERS');
  const defaultStartDate = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo;
  }, []);
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const dateRangeParams = useMemo(
    () => ({
      startDate: formatDateParam(startDate),
      endDate: formatDateParam(endDate),
    }),
    [endDate, startDate],
  );
  const { data, isLoading, error } = useGetDashboardMetricsQuery(dateRangeParams);
  useDocumentTitle(t('nav.dashboard'));

  const dashboardData = data?.data;
  const role = dashboardData?.role as RoleTypes | undefined;

  const isAdminOrStaff = role === RoleTypes.ADMIN || role === RoleTypes.STAFF;
  const isRider = role === RoleTypes.RIDER;
  const isBusiness = role === RoleTypes.BUSINESS;

  const { data: ordersChartResp } = useGetOrderChartDataQuery(
    { period: 'month', ...dateRangeParams },
    { skip: !(isAdminOrStaff || isBusiness || role === RoleTypes.CUSTOMER) },
  );
  const { data: revenueChartResp } = useGetRevenueChartDataQuery(
    { period: 'month', ...dateRangeParams },
    { skip: !isAdminOrStaff },
  );
  const { data: deliveriesChartResp } = useGetDeliveryChartDataQuery(
    { period: 'month', ...dateRangeParams },
    { skip: !isRider },
  );
  const { data: summaryChartResp, isFetching: summaryChartFetching } = useGetSummaryChartDataQuery(
    { metric, period: range, ...dateRangeParams },
    { skip: !role },
  );

  const quickActions = useMemo(() => getQuickActionsForRole(role, t), [role, t]);
  const statusBreakdown = useMemo(
    () => getDashboardStatusBreakdown(role, dashboardData?.metrics, t),
    [dashboardData?.metrics, role, t],
  );
  const recentActivity = useMemo(
    () => getDashboardRecentActivity(dashboardData?.metrics),
    [dashboardData?.metrics],
  );

  const summaryChartData = useMemo(
    () => normalizeChartData((summaryChartResp as { data?: Array<{ label: string; value: number }> })?.data),
    [summaryChartResp],
  );

  const ordersChartData = normalizeChartData(
    (ordersChartResp as { data?: Array<{ label: string; value: number }> })?.data,
  );
  const revenueChartData = normalizeChartData(
    (revenueChartResp as { data?: Array<{ label: string; value: number }> })?.data,
  );
  const deliveriesChartData = normalizeChartData(
    (deliveriesChartResp as { data?: Array<{ label: string; value: number }> })?.data,
  );
  const ordersSeries = useMemo(() => ordersChartData.map((point) => point.value), [ordersChartData]);
  const revenueSeries = useMemo(
    () => revenueChartData.map((point) => point.value),
    [revenueChartData],
  );
  const deliveriesSeries = useMemo(
    () => deliveriesChartData.map((point) => point.value),
    [deliveriesChartData],
  );
  const metricCards = useMemo(
    () =>
      buildMetricCards(dashboardData?.role, dashboardData?.metrics, {
        orders: ordersSeries,
        revenue: revenueSeries,
        deliveries: deliveriesSeries,
      }, t),
    [dashboardData?.metrics, dashboardData?.role, deliveriesSeries, ordersSeries, revenueSeries, t],
  );

  const summaryData = useMemo(() => {
    if (summaryChartData.length) return summaryChartData;
    if (isRider) return deliveriesChartData;
    if (isAdminOrStaff) return revenueChartData.length ? revenueChartData : ordersChartData;
    return ordersChartData;
  }, [deliveriesChartData, isAdminOrStaff, isRider, ordersChartData, revenueChartData, summaryChartData]);

  const supportWidgets = useMemo(
    () => buildSupportWidgets(role, ordersChartData, revenueChartData, deliveriesChartData, statusBreakdown, t),
    [deliveriesChartData, ordersChartData, revenueChartData, role, statusBreakdown, t],
  );

  const spotlightCards = useMemo(() => metricCards.slice(4, 8), [metricCards]);
  const contextCopy = useMemo(() => getContextCopy(role, t), [role, t]);
  const dispatchStripItems = useMemo<DispatchStripItem[]>(
    () =>
      statusBreakdown.slice(0, 4).map((item) => ({
        label: item.label,
        value: formatNumbers(item.value),
        status: getDispatchStatus(item.label),
      })),
    [statusBreakdown],
  );

  useEffect(() => {
    if (!role) return;
    const expectedDefault = metricDefaultsByRole[role];
    if (role === RoleTypes.RIDER && metric !== expectedDefault) {
      setMetric(expectedDefault);
    }
  }, [metric, role]);

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError />;

  return (
    <motion.main
      className="w-full flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader
        userName={user?.name}
        role={dashboardData?.role}
        actions={quickActions}
        variants={itemVariants}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Zone 2 — what is true right now. Headline metrics and live dispatch
          readings, previously two separate full-width rows of numbers. */}
      <DashboardMetricsSection
        cards={metricCards}
        dispatch={dispatchStripItems}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* Zone 3 — what is happening over time, beside what just happened. */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <DashboardSummaryChart
            range={range}
            metric={metric}
            onRangeChange={setRange}
            onMetricChange={setMetric}
            data={summaryData}
            role={role}
            breakdown={statusBreakdown}
            widgets={supportWidgets}
            isLoading={summaryChartFetching}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DashboardActivityPanel items={recentActivity} variants={itemVariants} />
        </div>
      </section>

      {/* Zone 4 — where to go next. */}
      <DashboardContextPanel
        title={contextCopy.title}
        description={contextCopy.description}
        highlights={spotlightCards}
        actions={quickActions}
        variants={itemVariants}
      />

    </motion.main>
  );
};

export default Dashboard;
