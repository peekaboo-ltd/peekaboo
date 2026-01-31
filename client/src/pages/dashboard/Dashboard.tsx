import { useAppSelector } from '@/states/hooks';
import {
  useGetDashboardMetricsQuery,
  useGetOrderChartDataQuery,
  useGetRevenueChartDataQuery,
} from '@/api/queries/dashboard.queries';
import { RoleTypes } from '@/types/auth.type';
import {
  AdminMetrics,
  RiderMetrics,
  CustomerMetrics,
  BusinessMetrics,
  MetricCardData,
} from '@/types/dashboard.type';
import {
  getAdminMetricCards,
  getRiderMetricCards,
  getCustomerMetricCards,
  getBusinessMetricCards,
} from '@/utils/dashboard.util';
import MetricCard from '@/components/dashboard/MetricCard';
import OrdersBarChart from '@/components/dashboard/OrdersBarChart';
import RevenueLineChart from '@/components/dashboard/RevenueLineChart';
import FleetEfficiencyChart from '@/components/dashboard/FleetEfficiencyChart';
import VehiclesStatusChart from '@/components/dashboard/VehiclesStatusChart';
import OrderSearchBar from '@/components/dashboard/OrderSearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/i18n';
import {
  fleetEfficiencyMockData,
  vehiclesOnRoadMockData,
  fleetMetricsMock,
  vehicleMetricsMock,
  sparklineMockData,
} from '@/data/dashboard.mock';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading, error } = useGetDashboardMetricsQuery({});

  const dashboardData = data?.data;
  const showCharts =
    dashboardData?.role === RoleTypes.ADMIN ||
    dashboardData?.role === RoleTypes.STAFF ||
    dashboardData?.role === RoleTypes.BUSINESS;

  const { data: ordersChartResp } = useGetOrderChartDataQuery(
    { period: 'month' },
    { skip: !showCharts }
  );
  const { data: revenueChartResp } = useGetRevenueChartDataQuery(
    { period: 'month' },
    { skip: !showCharts }
  );

  const getMetricCards = (): MetricCardData[] => {
    if (!dashboardData) return [];

    const { role, metrics } = dashboardData;

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

    // Enhance first few cards with sparklines for Admin/Staff/Business
    if (
      role === RoleTypes.ADMIN ||
      role === RoleTypes.STAFF ||
      role === RoleTypes.BUSINESS
    ) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (isLoading) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 py-6">
        <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <article>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </article>
          <Skeleton className="h-10 w-64" />
        </header>

        <section
          aria-label="Loading metrics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8"
        >
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </section>

        <section
          aria-label="Loading charts"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"
        >
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </section>

        <section
          aria-label="Loading fleet charts"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 py-6">
        <article className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('dashboard.failedToLoad')}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {t('dashboard.tryRefreshing')}
          </p>
        </article>
      </main>
    );
  }

  const metricCards = getMetricCards();
  const ordersChartData = (
    (ordersChartResp as unknown as { data?: Array<{ label: string; value: number }> })?.data || []
  ).map((p) => ({
    name: p.label,
    value: p.value,
  }));
  const revenueChartData = (
    (revenueChartResp as unknown as { data?: Array<{ label: string; value: number }> })?.data || []
  ).map((p) => ({
    name: p.label,
    value: p.value,
  }));

  const isBusinessView = dashboardData?.role === RoleTypes.BUSINESS;

  const businessShellClass = isBusinessView
    ? 'bg-slate-50/70 rounded-2xl border border-slate-200/60 shadow-sm'
    : '';
  const businessHeaderClass = isBusinessView
    ? 'bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm'
    : '';
  const businessTitleClass = isBusinessView ? 'text-primary-900' : 'text-gray-900';
  const businessSubtitleClass = isBusinessView ? 'text-slate-500' : 'text-gray-500';

  return (
    <motion.main
      className={`w-full max-w-7xl mx-auto px-4 py-6 ${businessShellClass}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header
        className={`mb-8 flex items-start justify-between gap-4 flex-wrap ${businessHeaderClass}`}
        variants={itemVariants}
      >
        <article>
          <h1 className={`text-2xl font-bold ${businessTitleClass}`}>
            {user?.name ? t('dashboard.welcome', { name: user.name }) : t('dashboard.welcomeDefault')}
          </h1>
          <p className={`${businessSubtitleClass} mt-1`}>
            {dashboardData?.role === RoleTypes.ADMIN ||
            dashboardData?.role === RoleTypes.STAFF
              ? t('dashboard.platformOverview')
              : t('dashboard.accountOverview')}
          </p>
        </article>
        <div className={isBusinessView ? 'w-full max-w-md' : undefined}>
          <OrderSearchBar placeholder={t('dashboard.searchPlaceholder')} />
        </div>
      </motion.header>

      {/* Primary Metrics */}
      <motion.section
        aria-label="Dashboard metrics"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8"
        variants={containerVariants}
      >
        {metricCards.slice(0, 5).map((card, index) => (
          <motion.div key={index} variants={itemVariants}>
            <MetricCard
              label={card.label}
              value={card.value}
              trend={card.trend}
              colorClass={isBusinessView ? 'text-primary' : card.colorClass}
              href={card.href}
              icon={card.icon}
              sparklineData={card.sparklineData}
              sparklineType={card.sparklineType}
            />
          </motion.div>
        ))}
      </motion.section>

      {/* Additional Metrics */}
      {metricCards.length > 5 && (
        <motion.section
          aria-label="Additional metrics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
        >
            {metricCards.slice(5).map((card, index) => (
              <motion.div key={index + 5} variants={itemVariants}>
                <MetricCard
                  label={card.label}
                  value={card.value}
                  trend={card.trend}
                  colorClass={isBusinessView ? 'text-primary' : card.colorClass}
                  href={card.href}
                  icon={card.icon}
                  sparklineData={card.sparklineData}
                  sparklineType={card.sparklineType}
                />
              </motion.div>
          ))}
        </motion.section>
      )}

      {/* Charts Section */}
      {showCharts && (
        <motion.section
          aria-label="Dashboard charts"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <OrdersBarChart data={ordersChartData} title={t('dashboard.ordersChart')} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RevenueLineChart data={revenueChartData} title={t('dashboard.revenueChart')} />
          </motion.div>
        </motion.section>
      )}

      {/* Fleet Charts */}
      {showCharts && (
        <motion.section
          aria-label="Fleet and vehicle charts"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <FleetEfficiencyChart
              data={fleetEfficiencyMockData}
              centerValue={fleetMetricsMock.efficiencyPercentage}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <VehiclesStatusChart
              data={vehiclesOnRoadMockData}
              totalVehicles={vehicleMetricsMock.totalVehicles}
              utilizationPercentage={65}
            />
          </motion.div>
        </motion.section>
      )}
    </motion.main>
  );
};

export default Dashboard;
