import type { BaseDomain } from './index';

export enum BusinessPlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface BusinessPlan extends BaseDomain {
  name: string;
  currency?: string;
  description?: string;
  pricePerOrder: number;
  status: BusinessPlanStatus;
  isDefault: boolean;
}
