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
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import OrdersBarChart from '@/components/dashboard/OrdersBarChart';
import RevenueLineChart from '@/components/dashboard/RevenueLineChart';
import OrderSearchBar from '@/components/dashboard/OrderSearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/i18n';

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

    switch (role) {
      case RoleTypes.ADMIN:
      case RoleTypes.STAFF:
        return getAdminMetricCards(metrics as AdminMetrics);
      case RoleTypes.BUSINESS:
        return getBusinessMetricCards(metrics as BusinessMetrics);
      case RoleTypes.RIDER:
        return getRiderMetricCards(metrics as RiderMetrics);
      case RoleTypes.CUSTOMER:
      default:
        return getCustomerMetricCards(metrics as CustomerMetrics);
    }
  };

  const getRecentActivity = () => {
    if (!dashboardData?.metrics) return [];
    return dashboardData.metrics.recentActivity || [];
  };

  if (isLoading) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 py-6">
        <header className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </header>
        <section aria-label="Loading metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </section>
        <section aria-label="Loading recent activity">
          <Skeleton className="h-64" />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 py-6">
        <article className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            {t('dashboard.failedToLoad')}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.tryRefreshing')}
          </p>
        </article>
      </main>
    );
  }

  const metricCards = getMetricCards();
  const recentActivity = getRecentActivity();
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

  return (
    <main className="w-full max-w-7xl mx-auto px-4 py-6">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <article>
          <h1 className="text-2xl font-bold text-primary">
            {user?.name ? t('dashboard.welcome', { name: user.name }) : t('dashboard.welcomeDefault')}
          </h1>
          <p className="text-muted-foreground">
            {dashboardData?.role === RoleTypes.ADMIN ||
            dashboardData?.role === RoleTypes.STAFF
              ? t('dashboard.platformOverview')
              : t('dashboard.accountOverview')}
          </p>
        </article>
        <OrderSearchBar placeholder={t('dashboard.searchPlaceholder')} />
      </header>

      <section aria-label="Dashboard metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, index) => (
          <MetricCard
            key={index}
            label={card.label}
            value={card.value}
            trend={card.trend}
            colorClass={card.colorClass}
            href={card.href}
            icon={card.icon}
          />
        ))}
      </section>

      {showCharts && (
        <section aria-label="Dashboard charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <OrdersBarChart data={ordersChartData} title={t('dashboard.ordersChart')} />
          <RevenueLineChart data={revenueChartData} title={t('dashboard.revenueChart')} />
        </section>
      )}

      <section aria-label="Recent activity">
        <RecentActivityCard activities={recentActivity} />
      </section>
    </main>
  );
};

export default Dashboard;
