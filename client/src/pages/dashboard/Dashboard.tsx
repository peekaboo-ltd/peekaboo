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
import DashboardChartsSection from './components/DashboardChartsSection';
import DashboardLoading from './components/DashboardLoading';
import DashboardError from './components/DashboardError';
import DashboardActivityPanel from './components/DashboardActivityPanel';
import DashboardContextPanel from './components/DashboardContextPanel';
import DashboardDispatchStrip, { type DispatchStripItem } from './components/DashboardDispatchStrip';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { formatCurrency, formatNumbers } from '@/utils/strings.util';

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
}: {
  cardLabel: string;
  role?: RoleTypes;
  ordersSeries: number[];
  revenueSeries: number[];
  deliveriesSeries: number[];
}) => {
  const label = cardLabel.toLowerCase();

  if (role === RoleTypes.RIDER) {
    return deliveriesSeries.length ? deliveriesSeries : ordersSeries;
  }

  if (label.includes('billing') || label.includes('payment') || label.includes('revenue')) {
    return revenueSeries.length ? revenueSeries : ordersSeries;
  }

  if (label.includes('assignment') || label.includes('deliver')) {
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
      baseCards = isAdminMetrics(metrics) ? getAdminMetricCards(metrics) : [];
      break;
    case RoleTypes.BUSINESS:
      baseCards = isBusinessMetrics(metrics) ? getBusinessMetricCards(metrics) : [];
      break;
    case RoleTypes.RIDER:
      baseCards = isRiderMetrics(metrics) ? getRiderMetricCards(metrics) : [];
      break;
    case RoleTypes.CUSTOMER:
    default:
      baseCards = isCustomerMetrics(metrics) ? getCustomerMetricCards(metrics) : [];
      break;
  }

  return baseCards.map((card, index) => {
    const selectedSeries = selectSeriesForCard({
      cardLabel: card.label,
      role,
      ordersSeries: seriesByCategory.orders,
      revenueSeries: seriesByCategory.revenue,
      deliveriesSeries: seriesByCategory.deliveries,
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

const getQuickActionsForRole = (role?: RoleTypes): DashboardActionLink[] => {
  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      return [
        { label: 'New Order', to: '/orders', icon: faPlus },
        { label: 'Orders', to: '/orders', icon: faShoppingCart },
        { label: 'Assignments', to: '/assignments', icon: faClipboardList },
        { label: 'Billing & Payments', to: '/billing-payments', icon: faCreditCard },
        { label: 'Users', to: '/users', icon: faUsers },
      ];
    case RoleTypes.BUSINESS:
      return [
        { label: 'New Order', to: '/orders', icon: faPlus },
        { label: 'My Orders', to: '/orders', icon: faShoppingCart },
        { label: 'Billing & Payments', to: '/billing-payments', icon: faCreditCard },
        { label: 'Request a Report', to: '/billing-payments', icon: faFileLines },
        { label: 'Team', to: '/users', icon: faUserGroup },
      ];
    case RoleTypes.RIDER:
      return [
        { label: 'Assignments', to: '/assignments', icon: faClipboardList },
        { label: 'My Deliveries', to: '/assignments', icon: faMotorcycle },
      ];
    case RoleTypes.CUSTOMER:
    default:
      return [
        { label: 'New Order', to: '/orders', icon: faPlus },
        { label: 'My Orders', to: '/orders', icon: faShoppingCart },
      ];
  }
};

const getWidgetSummary = (data: ChartDataPoint[], prefix?: 'currency') => {
  if (!data.length) {
    return 'No data';
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
          ? 'Delivery cadence'
          : role === RoleTypes.ADMIN || role === RoleTypes.STAFF
            ? 'Revenue pulse'
            : 'Order cadence',
      value:
        role === RoleTypes.ADMIN || role === RoleTypes.STAFF
          ? getWidgetSummary(primarySeries, 'currency')
          : getWidgetSummary(primarySeries),
      subtitle:
        role === RoleTypes.RIDER
          ? 'Rolling activity pulled from the delivery trend feed.'
          : 'Compact pulse of the most recent trend series.',
      chartType: role === RoleTypes.ADMIN || role === RoleTypes.STAFF ? 'line' : 'bar',
      accent: role === RoleTypes.ADMIN || role === RoleTypes.STAFF ? 'teal' : 'blue',
      data: primarySeries,
    },
    {
      title: role === RoleTypes.RIDER ? 'Assignment mix' : 'Status mix',
      value: formatNumbers(statusBreakdown.reduce((sum, item) => sum + item.value, 0)),
      subtitle: 'Distribution of the most recent status buckets.',
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

const getContextCopy = (role: RoleTypes | undefined) => {
  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      return {
        title: 'Operational pulse',
        description: 'Secondary KPIs and shortcuts to move from insight to action quickly.',
      };
    case RoleTypes.BUSINESS:
      return {
        title: 'Business pulse',
        description: 'Track fulfillment quality and move directly into account workflows.',
      };
    case RoleTypes.RIDER:
      return {
        title: 'Driver focus',
        description: 'Keep your queue, rates, and delivery momentum visible at a glance.',
      };
    case RoleTypes.CUSTOMER:
    default:
      return {
        title: 'Account pulse',
        description: 'See supporting order metrics and jump to the actions you use most.',
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
  useDocumentTitle('Dashboard');

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

  const quickActions = useMemo(() => getQuickActionsForRole(role), [role]);
  const statusBreakdown = useMemo(
    () => getDashboardStatusBreakdown(role, dashboardData?.metrics),
    [dashboardData?.metrics, role],
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
      }),
    [dashboardData?.metrics, dashboardData?.role, deliveriesSeries, ordersSeries, revenueSeries],
  );

  const summaryData = useMemo(() => {
    if (summaryChartData.length) return summaryChartData;
    if (isRider) return deliveriesChartData;
    if (isAdminOrStaff) return revenueChartData.length ? revenueChartData : ordersChartData;
    return ordersChartData;
  }, [deliveriesChartData, isAdminOrStaff, isRider, ordersChartData, revenueChartData, summaryChartData]);

  const supportWidgets = useMemo(
    () => buildSupportWidgets(role, ordersChartData, revenueChartData, deliveriesChartData, statusBreakdown),
    [deliveriesChartData, ordersChartData, revenueChartData, role, statusBreakdown],
  );

  const spotlightCards = useMemo(() => metricCards.slice(4, 8), [metricCards]);
  const contextCopy = useMemo(() => getContextCopy(role), [role]);
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

      <DashboardDispatchStrip items={dispatchStripItems} variants={itemVariants} />

      <DashboardMetricsSection
        cards={metricCards}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      <section className="grid grid-cols-12 gap-4">
        <section className="col-span-12 xl:col-span-8">
          <DashboardSummaryChart
            range={range}
            metric={metric}
            onRangeChange={setRange}
            onMetricChange={setMetric}
            data={summaryData}
            role={role}
            breakdown={statusBreakdown}
            isLoading={summaryChartFetching}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        </section>

        <section className="col-span-12 xl:col-span-4">
          <DashboardChartsSection widgets={supportWidgets} itemVariants={itemVariants} />
        </section>
      </section>

      <section className="grid grid-cols-12 gap-4">
        <section className="col-span-12 xl:col-span-8">
          <DashboardActivityPanel items={recentActivity} variants={itemVariants} />
        </section>
        <section className="col-span-12 xl:col-span-4">
          <DashboardContextPanel
            title={contextCopy.title}
            description={contextCopy.description}
            highlights={spotlightCards}
            actions={quickActions}
            variants={itemVariants}
          />
        </section>
      </section>
    </motion.main>
  );
};

export default Dashboard;
