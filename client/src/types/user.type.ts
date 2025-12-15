import type { BaseDomain, UUID } from './index';
import { UserStatus } from '../constants/user.constants';
import type { Order } from './order.type';
import type { OrderAssignment } from './orderAssignment.type';
import type { Role } from './auth.type';

export interface UserRole {
  id: UUID;
  userId: UUID;
  roleId: UUID;
  role: Role;
}

export interface User extends BaseDomain {
  id: UUID;
  name?: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  status: UserStatus;
  nationality?: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
  assignments: OrderAssignment[];
  orders: Order[];
  userRoles?: UserRole[];
}

// Rider is a User with RIDER role
export type Rider = User;
