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

export interface RiderPerformanceItem {
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
}

export interface RiderAttendanceItem {
  id: UUID;
  riderId: UUID;
  riderName?: string;
  riderPhoneNumber?: string;
  date: string;
  status: UserStatus;
  timestamp: string;
  imageUrl: string;
  locationLabel?: string;
}

export interface RiderProblemReportItem {
  id: UUID;
  riderId: UUID;
  riderName?: string;
  riderPhoneNumber?: string;
  imageUrl: string;
  mediaType?: 'photo' | 'video';
  description?: string;
  timestamp: string;
  locationLabel?: string;
}
