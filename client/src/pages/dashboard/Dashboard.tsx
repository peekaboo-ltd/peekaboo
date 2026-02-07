import { useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAppSelector } from '@/states/hooks';
import {
  useGetDashboardMetricsQuery,
  useGetOrderChartDataQuery,
  useGetRevenueChartDataQuery,
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

  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metric, setMetric] = useState<'ORDERS' | 'REVENUE' | 'ACTIVE_USERS'>('ORDERS');

  const dashboardData = data?.data;
  const showCharts =
    dashboardData?.role === RoleTypes.ADMIN ||
    dashboardData?.role === RoleTypes.STAFF ||
    dashboardData?.role === RoleTypes.BUSINESS;

  const { data: ordersChartResp } = useGetOrderChartDataQuery(
    { period: 'month' },
    { skip: !showCharts },
  );
  const { data: revenueChartResp } = useGetRevenueChartDataQuery(
    { period: 'month' },
    { skip: !showCharts },
  );

  const metricCards = useMemo(
    () => buildMetricCards(dashboardData?.role, dashboardData?.metrics),
    [dashboardData?.role, dashboardData?.metrics],
  );

  const summaryChartData = useMemo(() => {
    const labelsByRange: Record<'7d' | '30d' | '90d', string[]> = {
      '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      '30d': ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      '90d': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    const baseSeries: Record<'ORDERS' | 'REVENUE' | 'ACTIVE_USERS', number[]> = {
      ORDERS: [12, 16, 14, 18, 20, 19, 17, 22, 21, 24, 23, 25],
      REVENUE: [28, 30, 29, 34, 36, 33, 31, 37, 35, 39, 38, 42],
      ACTIVE_USERS: [8, 11, 10, 12, 13, 12, 11, 14, 13, 15, 14, 16],
    };

    const scale = range === '90d' ? 1.2 : range === '7d' ? 0.9 : 1;
    const labels = labelsByRange[range];
    const values = baseSeries[metric].slice(0, labels.length);

    return labels.map((label, index) => ({
      name: label,
      value: Math.round(values[index] * scale),
    }));
  }, [range, metric]);

  const ordersChartData = normalizeChartData((ordersChartResp as { data?: Array<{ label: string; value: number }> })?.data);
  const revenueChartData = normalizeChartData((revenueChartResp as { data?: Array<{ label: string; value: number }> })?.data);

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError />;

  return (
    <motion.main
      className="w-full flex flex-col gap-6 max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.22),_transparent_65%)]" />

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
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      <DashboardChartsSection
        showCharts={showCharts}
        ordersData={ordersChartData}
        revenueData={revenueChartData}
        ordersTitle="Orders"
        revenueTitle="Revenue"
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    </motion.main>
  );
};

export default Dashboard;
