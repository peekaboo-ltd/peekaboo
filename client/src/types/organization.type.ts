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
  createdAt: Date;
  updatedAt: Date;
}

export enum OrganizationStatus {
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
