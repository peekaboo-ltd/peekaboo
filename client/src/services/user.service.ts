import { api } from '../api/axios';
import type { User } from '../types/user.type';
import type { RoleTypes } from '../types/auth.type';
import { UserStatus } from '../constants/user.constants';

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roles?: RoleTypes[];
  status?: UserStatus;
  phoneNumber?: string;
  name?: string;
  email?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  name?: string;
  email?: string;
  phoneNumber: string;
  password?: string;
  roles: RoleTypes[];
  status?: UserStatus;
  nationality?: string;
  dateOfBirth?: Date;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  status?: UserStatus;
  nationality?: string;
  dateOfBirth?: Date;
  roles?: RoleTypes[];
}

class UserService {
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.status) params.append('status', filters.status);
      if (filters.roles && filters.roles.length > 0) {
        filters.roles.forEach(role => params.append('roles', role));
      }

      const response = await api.get<UsersResponse>(`/users?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      const response = await api.post<User>('/users', {
        phoneNumber: data.phoneNumber,
        roles: data.roles,
        ...data
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  async resetPassword(id: string): Promise<void> {
    try {
      await api.post(`/users/${id}/reset-password`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  async getUserOrders(userId: string): Promise<any[]> {
    try {
      const response = await api.get(`/users/${userId}/orders`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
    }
  }

  async getUserAssignments(userId: string): Promise<any[]> {
    try {
      const response = await api.get(`/users/${userId}/assignments`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user assignments');
    }
  }
}

export const userService = new UserService();
export default userService;