export enum BusinessPlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
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
  fallbackRate?: number; // price per order when a package tier's minimum is not fully met
}

export interface TierBreakdown {
  tierLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  type?: "package" | "fallback" | "per_unit" | "overflow";
}
