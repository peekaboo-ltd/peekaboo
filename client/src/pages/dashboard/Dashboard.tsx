import { useAppSelector } from '@/states/hooks';
import { useGetDashboardMetricsQuery } from '@/api/queries/dashboard.queries';
import { RoleTypes } from '@/types/auth.type';
import {
  AdminMetrics,
  RiderMetrics,
  CustomerMetrics,
  MetricCardData,
} from '@/types/dashboard.type';
import {
  getAdminMetricCards,
  getRiderMetricCards,
  getCustomerMetricCards,
} from '@/utils/dashboard.util';
import MetricCard from '@/components/dashboard/MetricCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading, error } = useGetDashboardMetricsQuery({});

  const dashboardData = data?.data;

  const getMetricCards = (): MetricCardData[] => {
    if (!dashboardData) return [];

    const { role, metrics } = dashboardData;

    switch (role) {
      case RoleTypes.ADMIN:
      case RoleTypes.STAFF:
        return getAdminMetricCards(metrics as AdminMetrics);
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </section>
        <Skeleton className="h-64" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 py-6">
        <article className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-muted-foreground">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </article>
      </main>
    );
  }

  const metricCards = getMetricCards();
  const recentActivity = getRecentActivity();

  return (
    <main className="w-full max-w-7xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your{' '}
          {dashboardData?.role === RoleTypes.ADMIN || dashboardData?.role === RoleTypes.STAFF
            ? 'platform'
            : 'account'}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, index) => (
          <MetricCard
            key={index}
            label={card.label}
            value={card.value}
            trend={card.trend}
            colorClass={card.colorClass}
          />
        ))}
      </section>

      <section>
        <RecentActivityCard activities={recentActivity} />
      </section>
    </main>
  );
};

export default Dashboard;
