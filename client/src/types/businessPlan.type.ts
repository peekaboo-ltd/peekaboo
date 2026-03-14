import type { UUID } from './index';

export enum BusinessPlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface BusinessPlan {
  id: UUID;
  name: string;
  description?: string;
  pricePerOrder: number;
  currency: string;
  status: BusinessPlanStatus;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessPlanPayload {
  name: string;
  description?: string;
  pricePerOrder: number;
  currency: string;
  status: BusinessPlanStatus;
  isDefault: boolean;
}

export type UpdateBusinessPlanPayload = Partial<CreateBusinessPlanPayload>;

export interface PaginatedBusinessPlansResponse {
  message: string;
  data: {
    list: BusinessPlan[];
    page: number;
    size: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface BusinessPlanOrganizationCountResponse {
  message: string;
  data: { count: number };
}
