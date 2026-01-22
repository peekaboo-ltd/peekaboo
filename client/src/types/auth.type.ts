import type { User } from './user.type';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: RoleTypes;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Role {
  id: string;
  name: RoleTypes;
  description?: string;
  label?: string;
  status: RoleStatus;
}

export enum RoleTypes {
  RIDER = 'RIDER',
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  BUSINESS = 'BUSINESS',
}

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}