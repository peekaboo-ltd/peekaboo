export interface Role {
  id: string;
  name: string;
}

export interface UserRole {
  id: string;
  role: Role;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth?: string;
  status: UserStatus;
  nationality?: string;
  userRoles?: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * API response structure for login endpoint
 */
export interface LoginApiResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * Transformed response structure used internally
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
