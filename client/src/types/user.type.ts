import type { BaseDomain, UUID } from './index';
import { UserStatus } from '../constants/user.constants';
import type { Order } from './order.type';
import type { OrderAssignment } from './orderAssignment.type';
import type { Role } from './auth.type';
import { OrganizationMembership } from './organizationMembership.types';

export interface UserRole {
  id: UUID;
  userId: UUID;
  roleId: UUID;
  role: Role;
}

export interface User extends BaseDomain {
  name?: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  status: UserStatus;
  nationality?: string;
  profilePhotoUrl?: string | null;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
  assignments: OrderAssignment[];
  orders: Order[];
  userRoles?: UserRole[];
  organizationMembership?: OrganizationMembership[];
  defaultLocation?: { latitude: number; longitude: number };
}

export type RiderManagementTimeframe = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RiderManagementItem {
  rank: number;
  riderId: UUID;
  riderName?: string;
  riderEmail?: string;
  riderPhoneNumber?: string;
  riderStatus: UserStatus;
  totalDeliveriesCompleted: number;
  totalEarnings: number;
  canceledDeliveries: number;
  failedDeliveries: number;
  activeDays: number;
  activeHours: number;
  dailyAttendance?: {
    date: string;
    isPresent: boolean;
    checkInAt?: string;
    checkOutAt?: string;
    checkInImageUrl?: string;
    checkOutImageUrl?: string;
  };
}
