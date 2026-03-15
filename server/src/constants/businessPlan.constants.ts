export enum BusinessPlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null; // null = unlimited
  pricePerUnit?: number; // per-delivery rate (e.g., monthly plans)
  totalPrice?: number; // package price (e.g., weekly/daily plans)
  label?: string; // display label e.g., "0 – 150 deliveries per month"
  isCustom?: boolean; // "contact us" tier
}

export interface PricingConfig {
  tiers: PricingTier[];
  overflowRate?: number; // price per extra delivery beyond defined tiers
}

export interface TierBreakdown {
  tierLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
