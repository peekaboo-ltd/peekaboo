import apiClient from './client';
import { LoginCredentials, AuthResponse, LoginApiResponse, User } from '../../types';

/**
 * Auth API endpoints
 */
export const authAPI = {
  /**
   * Login with username/email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials);
    // Extract user and token from nested response structure
    const { user, token } = response.data.data;
    return {
      user,
      token,
    };
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Refresh auth token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },
};
