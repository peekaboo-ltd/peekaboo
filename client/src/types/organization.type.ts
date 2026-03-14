import type { BaseDomain, UUID } from './index';
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
    businessPlanId?: string;
  };
  adminUser: {
    name?: string;
    email?: string;
    phoneNumber: string;
    password?: string;
  };
}

// Organization entity
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
  createdById: UUID;
  defaultLocation?: { latitude: number; longitude: number };
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

export enum BillingPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface OrganizationMembership {
  id: UUID;
  userId: UUID;
  organizationId: UUID;
  role: OrganizationRole;
  status: MembershipStatus;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}
