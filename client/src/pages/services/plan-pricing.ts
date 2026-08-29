import type { BusinessPlan, PricingTier } from '@/types/businessPlan.type';
import { BillingPeriod } from '@/types/businessPlan.type';

export type PricingTranslate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

/**
 * Everything the app knows about reading a business plan's price.
 *
 * These plans are not named SaaS tiers — they are volume bands. A buyer does
 * not decide "am I a Growth customer"; they know they send about forty
 * deliveries a month and want to know what that costs. Every function here
 * exists to answer that question, and the card, the details page, and the
 * calculator all read from this one module. The card and the details page used
 * to carry their own near-identical copies of this math.
 */

export const formatCurrency = (value: number, currency = 'RWF') =>
  `${Number(value).toLocaleString()} ${currency}`;

/** The unit a band is counted in: "40 deliveries per month". */
export const periodNoun = (billingPeriod: BillingPeriod, t: PricingTranslate) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return t('pricing.day');
    case BillingPeriod.WEEKLY:
      return t('pricing.week');
    case BillingPeriod.MONTHLY:
    default:
      return t('pricing.month');
  }
};

export const billingPeriodLabel = (billingPeriod: BillingPeriod, t: PricingTranslate) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return t('pricing.daily');
    case BillingPeriod.WEEKLY:
      return t('pricing.weekly');
    case BillingPeriod.MONTHLY:
    default:
      return t('pricing.monthly');
  }
};

export const isQuotable = (tier: PricingTier) =>
  !tier.isCustom && Boolean(tier.totalPrice || tier.pricePerUnit);

/** Bands in the order a buyer climbs them, smallest volume first. */
export const orderedTiers = (plan: BusinessPlan): PricingTier[] =>
  [...(plan.pricingTiers?.tiers ?? [])].sort(
    (a, b) => (a.minQuantity ?? 0) - (b.minQuantity ?? 0),
  );

export const cheapestTier = (plan: BusinessPlan) =>
  orderedTiers(plan)
    .filter(isQuotable)
    .sort((a, b) => {
      const aValue = a.totalPrice ?? a.pricePerUnit ?? Number.MAX_SAFE_INTEGER;
      const bValue = b.totalPrice ?? b.pricePerUnit ?? Number.MAX_SAFE_INTEGER;
      return aValue - bValue;
    })[0];

export const tierRangeLabel = (tier: PricingTier, billingPeriod: BillingPeriod, t: PricingTranslate) => {
  if (tier.label) return tier.label;
  if (tier.isCustom) return t('pricing.customVolume');

  const unit = periodNoun(billingPeriod, t);
  if (tier.maxQuantity == null) {
    return t('pricing.deliveriesPer', { count: `${tier.minQuantity}+`, unit });
  }
  return t('pricing.deliveriesRangePer', { min: tier.minQuantity, max: tier.maxQuantity, unit });
};

/** The short form used inside a card, where the cadence is stated once above. */
export const tierRangeShort = (tier: PricingTier, t: PricingTranslate) => {
  if (tier.isCustom) return t('pricing.custom');
  if (tier.maxQuantity == null) return `${tier.minQuantity}+`;
  return `${tier.minQuantity}–${tier.maxQuantity}`;
};

/**
 * The headline price, kept as parts rather than a sentence. A card needs to
 * set the numeral large and the qualifiers small; handing it a baked
 * "From 15,000 RWF / delivery" string forced every surface to typeset a whole
 * sentence at display size, which is why prices never lined up across cards.
 */
export interface PriceParts {
  /** "15,000" — or undefined when the plan is quoted rather than listed. */
  amount?: string;
  currency: string;
  /** "per delivery", "per month" — the cadence the amount is charged at. */
  cadence?: string;
  /** Set when there is no listed number: "Priced with our team". */
  note?: string;
  /** True when the price is a floor, so the card can say "from". */
  isFrom: boolean;
}

export const resolvePrice = (plan: BusinessPlan, t: PricingTranslate): PriceParts => {
  const currency = plan.currency || 'RWF';

  if (plan.isCustomPricing) {
    return { currency, note: t('pricing.withTeam'), isFrom: false };
  }

  const tier = cheapestTier(plan);

  if (tier?.totalPrice) {
    return {
      amount: Number(tier.totalPrice).toLocaleString(),
      currency,
      cadence: t('pricing.perUnit', { unit: periodNoun(plan.billingPeriod, t) }),
      isFrom: true,
    };
  }

  if (tier?.pricePerUnit) {
    return {
      amount: Number(tier.pricePerUnit).toLocaleString(),
      currency,
      cadence: t('pricing.perDelivery'),
      isFrom: true,
    };
  }

  if (plan.pricePerOrder) {
    return {
      amount: Number(plan.pricePerOrder).toLocaleString(),
      currency,
      cadence: t('pricing.perDelivery'),
      isFrom: true,
    };
  }

  return { currency, note: t('pricing.withTeam'), isFrom: false };
};

/** Flat, printable form — for a document title or a plain-text summary. */
export const headlinePriceText = (plan: BusinessPlan, t: PricingTranslate) => {
  const price = resolvePrice(plan, t);
  if (!price.amount) return price.note ?? t('pricing.contact');
  return `${price.isFrom ? `${t('pricing.from')} ` : ''}${price.amount} ${price.currency} ${price.cadence}`;
};

export interface PricingRow {
  key: string;
  tier: PricingTier;
  /** "1–20 deliveries per month" */
  label: string;
  /** "1–20" */
  range: string;
  /** "18,000 RWF" or "600 RWF per delivery" */
  priceLabel: string;
  /** Effective cost of one delivery at the top of the band, when knowable. */
  perDeliveryLabel?: string;
  isCustom: boolean;
}

export const getPricingRows = (plan: BusinessPlan, t: PricingTranslate): PricingRow[] =>
  orderedTiers(plan).map((tier, index) => {
    const currency = plan.currency || 'RWF';

    // A package price divided across the band's ceiling is the number a buyer
    // actually compares between plans, and no surface was showing it.
    const ceiling = tier.maxQuantity ?? tier.minQuantity;
    const perDelivery =
      tier.pricePerUnit ??
      (tier.totalPrice && ceiling ? Math.round(tier.totalPrice / ceiling) : undefined);

    return {
      key: `${tier.minQuantity ?? index}-${tier.maxQuantity ?? 'plus'}-${index}`,
      tier,
      label: tierRangeLabel(tier, plan.billingPeriod, t),
      range: tierRangeShort(tier, t),
      priceLabel: tier.isCustom
        ? t('services.details.quoted')
        : tier.totalPrice
          ? formatCurrency(tier.totalPrice, currency)
          : tier.pricePerUnit
            ? t('pricing.pricePerDelivery', { price: formatCurrency(tier.pricePerUnit, currency) })
            : t('pricing.included'),
      perDeliveryLabel:
        !tier.isCustom && perDelivery ? formatCurrency(perDelivery, currency) : undefined,
      isCustom: Boolean(tier.isCustom),
    };
  });

export interface Quote {
  /** The band the volume lands in, if any band covers it. */
  row?: PricingRow;
  /** Deliveries beyond the top band, billed at the overflow rate. */
  overflowCount: number;
  overflowTotal: number;
  total?: number;
  perDelivery?: number;
  currency: string;
  /** Set when the volume cannot be priced from the published bands. */
  note?: string;
}

/**
 * What a given monthly volume actually costs on this plan. This is the whole
 * point of the pricing page, and until now the buyer had to do it in their
 * head from a list of bands.
 */
export const quoteForVolume = (plan: BusinessPlan, volume: number, t: PricingTranslate): Quote => {
  const currency = plan.currency || 'RWF';
  const rows = getPricingRows(plan, t);
  const empty: Quote = { overflowCount: 0, overflowTotal: 0, currency };

  if (!Number.isFinite(volume) || volume <= 0) {
    return { ...empty, note: t('pricing.enterVolume') };
  }

  if (plan.isCustomPricing || !rows.length) {
    return { ...empty, note: t('pricing.planQuoted') };
  }

  const row = rows.find((candidate) => {
    const { minQuantity, maxQuantity } = candidate.tier;
    if (candidate.isCustom) return false;
    if (volume < (minQuantity ?? 0)) return false;
    return maxQuantity == null || volume <= maxQuantity;
  });

  if (!row) {
    // Below the smallest band, or past the top of a capped ladder.
    const quotable = rows.filter((candidate) => !candidate.isCustom);
    const smallest = quotable[0];
    if (smallest && volume < (smallest.tier.minQuantity ?? 0)) {
      return {
        ...empty,
        note: t('pricing.startsAt', { count: smallest.tier.minQuantity, unit: periodNoun(plan.billingPeriod, t) }),
      };
    }
    return { ...empty, note: t('pricing.volumeQuoted') };
  }

  const { tier } = row;
  const overflowRate = plan.pricingTiers?.overflowRate;
  const base = tier.totalPrice ?? (tier.pricePerUnit ? tier.pricePerUnit * volume : undefined);

  if (base == null) {
    return { ...empty, row, note: t('pricing.bandQuoted') };
  }

  // Only a capped package band can overflow; a per-delivery band scales.
  const included = tier.totalPrice && tier.maxQuantity != null ? tier.maxQuantity : volume;
  const overflowCount = Math.max(0, volume - included);
  const overflowTotal = overflowRate ? overflowCount * overflowRate : 0;
  const total = base + overflowTotal;

  return {
    row,
    overflowCount,
    overflowTotal,
    total,
    perDelivery: Math.round(total / volume),
    currency,
  };
};
