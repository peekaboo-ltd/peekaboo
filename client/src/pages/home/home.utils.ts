import type { BusinessPlan as ApiBusinessPlan, PricingTier } from '@/types/businessPlan.type';
import { BillingPeriod } from '@/types/businessPlan.type';
import type { BusinessPlan } from './home.types';

const formatCurrency = (value: number, currency = 'RWF') =>
  `${Number(value).toLocaleString()} ${currency}`;

const getBillingPeriodSuffix = (billingPeriod: BillingPeriod) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return 'day';
    case BillingPeriod.WEEKLY:
      return 'week';
    case BillingPeriod.MONTHLY:
    default:
      return 'delivery';
  }
};

const getFirstDisplayTier = (tiers?: PricingTier[]) => {
  if (!tiers?.length) return undefined;

  return [...tiers]
    .filter((tier) => !tier.isCustom && (tier.totalPrice || tier.pricePerUnit))
    .sort((a, b) => {
      const aValue = a.totalPrice ?? a.pricePerUnit ?? Number.MAX_SAFE_INTEGER;
      const bValue = b.totalPrice ?? b.pricePerUnit ?? Number.MAX_SAFE_INTEGER;
      return aValue - bValue;
    })[0];
};

const getTierRangeLabel = (tier: PricingTier, billingPeriod: BillingPeriod) => {
  if (tier.label) return tier.label;

  if (tier.isCustom) return 'Custom range';

  const periodUnit =
    billingPeriod === BillingPeriod.DAILY
      ? 'day'
      : billingPeriod === BillingPeriod.WEEKLY
        ? 'week'
        : 'month';

  if (tier.maxQuantity == null) {
    return `${tier.minQuantity}+ deliveries per ${periodUnit}`;
  }

  return `${tier.minQuantity} – ${tier.maxQuantity} deliveries per ${periodUnit}`;
};

const getHeadlinePrice = (plan: ApiBusinessPlan) => {
  if (plan.isCustomPricing) {
    return 'Custom monthly pricing';
  }

  const firstTier = getFirstDisplayTier(plan.pricingTiers?.tiers);
  if (firstTier?.totalPrice) {
    return `From ${formatCurrency(firstTier.totalPrice, plan.currency)} / ${getBillingPeriodSuffix(plan.billingPeriod)}`;
  }

  if (firstTier?.pricePerUnit) {
    return `From ${formatCurrency(firstTier.pricePerUnit, plan.currency)} / delivery`;
  }

  if (plan.pricePerOrder) {
    return `From ${formatCurrency(Number(plan.pricePerOrder), plan.currency)} / delivery`;
  }

  return 'Contact us for pricing';
};

export const mapApiPlanToCard = (plan: ApiBusinessPlan): BusinessPlan => ({
  name: plan.name,
  description: plan.description || 'Flexible pricing for growing teams.',
  price: getHeadlinePrice(plan),
  features: plan.features?.length
    ? plan.features
    : (plan.pricingTiers?.tiers || [])
        .map((tier) => {
          if (tier.isCustom) {
            return tier.label || 'Custom pricing available';
          }
          const tierLabel = getTierRangeLabel(tier, plan.billingPeriod);
          if (tier.totalPrice) {
            return `${tierLabel} → ${formatCurrency(tier.totalPrice, plan.currency)}`;
          }
          if (tier.pricePerUnit) {
            return `${tierLabel} → ${formatCurrency(tier.pricePerUnit, plan.currency)} per delivery`;
          }
          return tierLabel;
        })
        .filter(Boolean),
  isPopular: Boolean(plan.badge) || plan.isDefault,
  detailsTo: `/services/${plan.slug}`,
});
