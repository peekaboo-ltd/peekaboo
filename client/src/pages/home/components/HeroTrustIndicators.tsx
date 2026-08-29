import type { LandingStats } from '@/types/landing.type';
import { useI18n } from '@/i18n/i18n';

interface HeroTrustIndicatorsProps {
  landingStats?: LandingStats;
  activeCustomersLabel: string;
  completedOrdersLabel: string;
  fallbackLabel: string;
}

const HeroTrustIndicators = ({
  landingStats,
  activeCustomersLabel,
  completedOrdersLabel,
  fallbackLabel,
}: HeroTrustIndicatorsProps) => {
  const { t } = useI18n();
  const activeCustomers = landingStats?.activeCustomers;
  const completedOrders = landingStats?.customersWithOrders;

  const items = [
    typeof activeCustomers === 'number' && activeCustomers > 0
      ? `${activeCustomers.toLocaleString()} ${activeCustomersLabel}`
      : fallbackLabel,
    typeof completedOrders === 'number' && completedOrders > 0
      ? `${completedOrders.toLocaleString()} ${completedOrdersLabel}`
      : t('home.hero.verifiedRiders'),
    t('home.trust.kigaliWide'),
  ];

  return (
    <p className="type-meta flex flex-wrap items-center gap-x-2">
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-x-2">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <span>{item}</span>
        </span>
      ))}
    </p>
  );
};

export default HeroTrustIndicators;
