import type { BusinessPlan, PricingTier } from '@/types/businessPlan.type';
import { BillingPeriod } from '@/types/businessPlan.type';

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
export const periodNoun = (billingPeriod: BillingPeriod) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return 'day';
    case BillingPeriod.WEEKLY:
      return 'week';
    case BillingPeriod.MONTHLY:
    default:
      return 'month';
  }
};

export const billingPeriodLabel = (billingPeriod: BillingPeriod) => {
  switch (billingPeriod) {
    case BillingPeriod.DAILY:
      return 'Daily';
    case BillingPeriod.WEEKLY:
      return 'Weekly';
    case BillingPeriod.MONTHLY:
    default:
      return 'Monthly';
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

export const tierRangeLabel = (tier: PricingTier, billingPeriod: BillingPeriod) => {
  if (tier.label) return tier.label;
  if (tier.isCustom) return 'Custom volume';

  const unit = periodNoun(billingPeriod);
  if (tier.maxQuantity == null) {
    return `${tier.minQuantity}+ deliveries per ${unit}`;
  }
  return `${tier.minQuantity}–${tier.maxQuantity} deliveries per ${unit}`;
};

/** The short form used inside a card, where the cadence is stated once above. */
export const tierRangeShort = (tier: PricingTier) => {
  if (tier.isCustom) return 'Custom';
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

export const resolvePrice = (plan: BusinessPlan): PriceParts => {
  const currency = plan.currency || 'RWF';

  if (plan.isCustomPricing) {
    return { currency, note: 'Priced with our team', isFrom: false };
  }

  const tier = cheapestTier(plan);

  if (tier?.totalPrice) {
    return {
      amount: Number(tier.totalPrice).toLocaleString(),
      currency,
      cadence: `per ${periodNoun(plan.billingPeriod)}`,
      isFrom: true,
    };
  }

  if (tier?.pricePerUnit) {
    return {
      amount: Number(tier.pricePerUnit).toLocaleString(),
      currency,
      cadence: 'per delivery',
      isFrom: true,
    };
  }

  if (plan.pricePerOrder) {
    return {
      amount: Number(plan.pricePerOrder).toLocaleString(),
      currency,
      cadence: 'per delivery',
      isFrom: true,
    };
  }

  return { currency, note: 'Priced with our team', isFrom: false };
};

/** Flat, printable form — for a document title or a plain-text summary. */
export const headlinePriceText = (plan: BusinessPlan) => {
  const price = resolvePrice(plan);
  if (!price.amount) return price.note ?? 'Contact us for pricing';
  return `${price.isFrom ? 'From ' : ''}${price.amount} ${price.currency} ${price.cadence}`;
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

export const getPricingRows = (plan: BusinessPlan): PricingRow[] =>
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
      label: tierRangeLabel(tier, plan.billingPeriod),
      range: tierRangeShort(tier),
      priceLabel: tier.isCustom
        ? 'Quoted'
        : tier.totalPrice
          ? formatCurrency(tier.totalPrice, currency)
          : tier.pricePerUnit
            ? `${formatCurrency(tier.pricePerUnit, currency)} / delivery`
            : 'Included',
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
export const quoteForVolume = (plan: BusinessPlan, volume: number): Quote => {
  const currency = plan.currency || 'RWF';
  const rows = getPricingRows(plan);
  const empty: Quote = { overflowCount: 0, overflowTotal: 0, currency };

  if (!Number.isFinite(volume) || volume <= 0) {
    return { ...empty, note: 'Enter how many deliveries you send.' };
  }

  if (plan.isCustomPricing || !rows.length) {
    return { ...empty, note: 'This plan is quoted with our team.' };
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
        note: `Plans on this package start at ${smallest.tier.minQuantity} deliveries per ${periodNoun(plan.billingPeriod)}.`,
      };
    }
    return { ...empty, note: 'This volume is quoted with our team.' };
  }

  const { tier } = row;
  const overflowRate = plan.pricingTiers?.overflowRate;
  const base = tier.totalPrice ?? (tier.pricePerUnit ? tier.pricePerUnit * volume : undefined);

  if (base == null) {
    return { ...empty, row, note: 'This band is quoted with our team.' };
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
