import { useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAppSelector } from '@/states/hooks';
import {
  useGetDashboardMetricsQuery,
  useGetOrderChartDataQuery,
  useGetRevenueChartDataQuery,
  useGetDeliveryChartDataQuery,
  useGetSummaryChartDataQuery,
} from '@/api/queries/dashboard.queries';
import { RoleTypes } from '@/types/auth.type';
import {
  AdminMetrics,
  BusinessMetrics,
  CustomerMetrics,
  MetricCardData,
  RiderMetrics,
  ChartDataPoint,
} from '@/types/dashboard.type';
import {
  getAdminMetricCards,
  getBusinessMetricCards,
  getCustomerMetricCards,
  getRiderMetricCards,
} from '@/utils/dashboard.util';
import { sparklineMockData } from '@/data/dashboard.mock';
import DashboardHeader from './components/DashboardHeader';
import DashboardMetricsSection from './components/DashboardMetricsSection';
import DashboardSummaryChart from './components/DashboardSummaryChart';
import DashboardChartsSection from './components/DashboardChartsSection';
import DashboardLoading from './components/DashboardLoading';
import DashboardError from './components/DashboardError';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const buildMetricCards = (
  role: RoleTypes | undefined,
  metrics: AdminMetrics | BusinessMetrics | RiderMetrics | CustomerMetrics | undefined,
): MetricCardData[] => {
  if (!role || !metrics) return [];

  let baseCards: MetricCardData[] = [];

  switch (role) {
    case RoleTypes.ADMIN:
    case RoleTypes.STAFF:
      baseCards = getAdminMetricCards(metrics as AdminMetrics);
      break;
    case RoleTypes.BUSINESS:
      baseCards = getBusinessMetricCards(metrics as BusinessMetrics);
      break;
    case RoleTypes.RIDER:
      baseCards = getRiderMetricCards(metrics as RiderMetrics);
      break;
    case RoleTypes.CUSTOMER:
    default:
      baseCards = getCustomerMetricCards(metrics as CustomerMetrics);
      break;
  }

  if (role === RoleTypes.ADMIN || role === RoleTypes.STAFF || role === RoleTypes.BUSINESS) {
    return baseCards.map((card, index) => {
      if (index === 0) {
        return {
          ...card,
          sparklineData: sparklineMockData.orders,
          sparklineType: 'line' as const,
        };
      }
      if (index === 2) {
        return {
          ...card,
          sparklineData: sparklineMockData.profit,
          sparklineType: 'bar' as const,
        };
      }
      return card;
    });
  }

  return baseCards;
};

const normalizeChartData = (payload?: Array<{ label?: string; name?: string; value?: number | string }>): ChartDataPoint[] => {
  if (!payload?.length) return [];

  return payload
    .map((point, index) => {
      const name = point.label ?? point.name ?? `P${index + 1}`;
      const value = Number(point.value ?? 0);
      return {
        name,
        value: Number.isFinite(value) ? value : 0,
      };
    })
    .filter((point) => point.name);
};

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading, error } = useGetDashboardMetricsQuery({});
  useDocumentTitle('Dashboard');

  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metric, setMetric] = useState<string>('ORDERS');

  const dashboardData = data?.data;
  const role = dashboardData?.role;

  const isAdminOrStaff = role === RoleTypes.ADMIN || role === RoleTypes.STAFF;
  const isRider = role === RoleTypes.RIDER;
  const isBusiness = role === RoleTypes.BUSINESS;
  const showOrdersChart = isAdminOrStaff || isBusiness;
  const showRevenueChart = isAdminOrStaff;
  const showDeliveriesChart = isRider;
  const showCharts = showOrdersChart || showRevenueChart || showDeliveriesChart;

  const { data: ordersChartResp } = useGetOrderChartDataQuery(
    { period: 'month' },
    { skip: !showOrdersChart },
  );
  const { data: revenueChartResp } = useGetRevenueChartDataQuery(
    { period: 'month' },
    { skip: !showRevenueChart },
  );
  const { data: deliveriesChartResp } = useGetDeliveryChartDataQuery(
    { period: 'month' },
    { skip: !showDeliveriesChart },
  );
  const { data: summaryChartResp, isFetching: summaryChartFetching } = useGetSummaryChartDataQuery(
    { metric, period: range },
    { skip: !role },
  );

  const metricCards = useMemo(
    () => buildMetricCards(dashboardData?.role, dashboardData?.metrics),
    [dashboardData?.role, dashboardData?.metrics],
  );

  const summaryChartData = useMemo(
    () => normalizeChartData((summaryChartResp as { data?: Array<{ label: string; value: number }> })?.data),
    [summaryChartResp],
  );

  const ordersChartData = normalizeChartData((ordersChartResp as { data?: Array<{ label: string; value: number }> })?.data);
  const revenueChartData = normalizeChartData((revenueChartResp as { data?: Array<{ label: string; value: number }> })?.data);
  const deliveriesChartData = normalizeChartData((deliveriesChartResp as { data?: Array<{ label: string; value: number }> })?.data);

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError />;

  return (
    <motion.main
      className="w-full flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader
        userName={user?.name}
        role={dashboardData?.role}
        variants={itemVariants}
      />

      <DashboardMetricsSection
        cards={metricCards}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      <DashboardSummaryChart
        range={range}
        metric={metric}
        onRangeChange={setRange}
        onMetricChange={setMetric}
        data={summaryChartData}
        role={role}
        isLoading={summaryChartFetching}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      <DashboardChartsSection
        showCharts={showCharts}
        ordersData={ordersChartData}
        revenueData={revenueChartData}
        deliveriesData={deliveriesChartData}
        ordersTitle="Orders"
        revenueTitle="Revenue"
        role={role}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    </motion.main>
  );
};

export default Dashboard;
