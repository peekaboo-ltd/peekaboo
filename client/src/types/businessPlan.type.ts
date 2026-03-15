import type { BaseDomain } from './index';
import { BillingPeriod } from './organization.type';

export { BillingPeriod };

export enum BusinessPlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit?: number;
  totalPrice?: number;
  label?: string;
  isCustom?: boolean;
}

export interface PricingConfig {
  tiers: PricingTier[];
  overflowRate?: number;
}

export interface BusinessPlan extends BaseDomain {
  name: string;
  currency?: string;
  description?: string;
  pricePerOrder?: number;
  features: string[];
  pricingTiers?: PricingConfig;
  billingPeriod: BillingPeriod;
  badge?: string;
  isCustomPricing: boolean;
  status: BusinessPlanStatus;
  isDefault: boolean;
}

export interface CreateBusinessPlanPayload {
  name: string;
  description?: string;
  currency: string;
  features: string[];
  pricingTiers?: PricingConfig;
  billingPeriod: BillingPeriod;
  badge?: string;
  isCustomPricing: boolean;
  status: BusinessPlanStatus;
  isDefault: boolean;
}

export type UpdateBusinessPlanPayload = Partial<CreateBusinessPlanPayload>;
