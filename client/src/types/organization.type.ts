import type { BaseDomain, UUID } from './index';
import type { Order } from './order.type';
import type { User } from './user.type';

// Form data types for onboarding steps
export interface OrganizationFormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  industry: string;
  deliveryVolume: string;
}

export interface AdminFormData {
  name: string;
  email: string;
  phoneNumber: string;
  title: string;
  password: string;
  confirmPassword: string;
}

export interface TeamMemberFormData {
  name: string;
  email: string;
}

export enum BillingPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

// Redux onboarding state
export interface OnboardingState {
  organization: OrganizationFormData;
  admin: AdminFormData;
  teamMembers: TeamMemberFormData[];
  currentStep: 1 | 2 | 3;
}

// API payload for creating organization
export interface CreateOrganizationPayload {
  organization: {
    name: string;
    description?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    tin?: string;
    status?: OrganizationStatus;
    businessPlanId?: string;
    billingPeriod?: BillingPeriod;
    paymentTermsDays?: number;
    defaultLocation?: { latitude: number; longitude: number };
  };
  adminUser: {
    name?: string;
    email?: string;
    phoneNumber: string;
    password?: string;
  };
}

// Organization entity (aligned with server organization.entity.ts)
export interface Organization extends BaseDomain {
  id: UUID;
  name: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  tin?: string;
  status: OrganizationStatus;
  businessPlanId?: UUID;
  billingPeriod: BillingPeriod;
  paymentTermsDays: number;
  createdById: UUID;
  defaultLocation?: { latitude: number; longitude: number };
  businessPlan?: {
    id: UUID;
    name?: string;
    billingPeriod?: string;
    currency?: string;
    pricePerOrder?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum OrganizationRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED',
}

// API response types
export interface CreateOrganizationResponse {
  message: string;
  data: {
    organization: Organization;
    auth: {
      token: string;
      user: User;
    };
  };
}

// Contact inquiry types
export interface ContactInquiryPayload {
  contactName: string;
  contactEmail: string;
  companyName: string;
  phoneNumber?: string;
  subject?: string;
  message?: string;
}

export interface ContactInquiryResponse {
  message: string;
}

// Onboarding token validation
export interface ValidateOnboardingTokenResponse {
  message: string;
  data: {
    organizationName: string;
    organizationEmail: string;
  };
}

// Complete onboarding types
export interface CompleteOnboardingPayload {
  token: string;
  password: string;
  phoneNumber: string;
  adminName?: string;
  organizationDetails?: {
    address?: string;
    description?: string;
    phoneNumber?: string;
  };
}

export interface CompleteOnboardingResponse {
  message: string;
  data: {
    organization: Organization;
    auth: {
      token: string;
      user: User;
    };
  };
}

export interface InviteOrganizationPayload {
  name: string;
  email: string;
  adminName: string;
  adminEmail: string;
  phoneNumber: string;
  address: string;
}

export interface InviteOrganizationResponse {
  message: string;
}

export type TierBreakdownType = 'package' | 'fallback' | 'per_unit' | 'overflow';

export interface TierBreakdown {
  tierLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  type?: TierBreakdownType;
}

export interface BillingPricingTierSnapshot {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit?: number;
  totalPrice?: number;
  label?: string;
  isCustom?: boolean;
}

export interface BillingPricingSnapshot {
  tiers?: BillingPricingTierSnapshot[];
  overflowRate?: number;
  fallbackRate?: number;
}

export interface OrganizationBillingPlanSummary {
  id: UUID;
  name?: string;
  billingPeriod?: string;
  currency?: string;
  pricePerOrder?: number;
}

export interface OrganizationBillingSummary {
  id: UUID;
  organizationId: UUID;
  totalOrders: number;
  totalAmount: number;
  currency?: string;
  status: string;
  paidAt?: string | Date;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  periodStart?: string | Date;
  periodEnd?: string | Date;
  invoiceNumber?: string;
  organization?: { id: UUID; name?: string };
  businessPlan?: OrganizationBillingPlanSummary;
  pricingSnapshot?: BillingPricingSnapshot;
  tierBreakdown?: TierBreakdown[];
  orders?: Order[];
}

export interface BillingBreakdownResponseData {
  billing: OrganizationBillingSummary;
  breakdown: TierBreakdown[];
  planName: string;
  billingPeriod: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  totalOrders: number;
  totalAmount: number;
  currency: string;
}

export interface BillingBreakdownResponse {
  message: string;
  data: BillingBreakdownResponseData;
}

export interface EarlyPaymentEstimateResponseData {
  billing: OrganizationBillingSummary;
  breakdown: TierBreakdown[];
  totalAmount: number;
  currency: string;
  note: string;
}

export interface EarlyPaymentEstimateResponse {
  message: string;
  data: EarlyPaymentEstimateResponseData;
}
