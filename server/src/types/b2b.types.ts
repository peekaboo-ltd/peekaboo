import { UUID } from '.';
import {
  OrganizationStatus,
  OrganizationRole,
  MembershipStatus,
  BillingStatus,
  BillingPeriod,
} from '../constants/organization.constants';
import { BusinessPlanStatus } from '../constants/businessPlan.constants';

// Base pagination and sorting query params
export interface BasePaginationQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Date range filter
export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

// Organization query params
export interface OrganizationQuery extends BasePaginationQuery, DateRangeQuery {
  search?: string;
  status?: OrganizationStatus;
  businessPlanId?: UUID;
}

// Organization membership query params
export interface MembershipQuery extends BasePaginationQuery, DateRangeQuery {
  search?: string;
  role?: OrganizationRole;
  status?: MembershipStatus;
}

// Business plan query params
export interface BusinessPlanQuery extends BasePaginationQuery, DateRangeQuery {
  search?: string;
  status?: BusinessPlanStatus;
}

// Billing query params
export interface BillingQuery extends BasePaginationQuery, DateRangeQuery {
  status?: BillingStatus;
  billingPeriod?: BillingPeriod;
}

// Order query params for organization orders
export interface OrganizationOrderQuery extends BasePaginationQuery, DateRangeQuery {
  status?: string;
  search?: string;
}

// Member update data
export interface MemberUpdateData {
  name?: string;
  email?: string;
}

// Organization statistics
export interface OrganizationStatistics {
  totalMembers: number;
  activeMembers: number;
  totalOrders: number;
  totalSpent: number;
  pendingBilling: number;
  currentPlan: {
    id: UUID;
    name: string;
    pricePerOrder: number;
  } | null;
}

// Billing summary for all organizations (admin view)
export interface GlobalBillingSummary {
  totalOrganizations: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalInvoiced: number;
  organizationBreakdown: Array<{
    organizationId: UUID;
    organizationName: string;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  }>;
}
