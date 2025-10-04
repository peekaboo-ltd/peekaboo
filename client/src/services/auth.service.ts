import { api } from '../api/axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.type';
import type { User } from '../types/user.type';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

class AuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage
    this.token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (this.token) {
      this.setAuthHeader(this.token);
    }
  }

  private setAuthHeader(token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private removeAuthHeader() {
    delete api.defaults.headers.common['Authorization'];
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<{
        message: string;
        data: {
          user: User;
          token: string;
        };
      }>('/auth/login', credentials);

      const { user, token } = response.data.data;
      
      // Store token and user
      this.token = token;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      // Set auth header for future requests
      this.setAuthHeader(token);

      // Handle remember me
      if (!credentials.rememberMe) {
        // If not remember me, store in sessionStorage instead
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }

      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<{
        message: string;
        data: {
          user: User;
          token: string;
        };
      }>('/auth/register', userData);
      
      const { user, token } = response.data.data;
      
      // Store token and user
      this.token = token;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      // Set auth header for future requests
      this.setAuthHeader(token);
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    this.removeAuthHeader();
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{
        message: string;
        data: User;
      }>('/auth/me');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await api.post<{
        message: string;
        data: { token: string };
      }>('/auth/refresh');
      const { token } = response.data.data;
      
      this.token = token;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      this.setAuthHeader(token);
      
      return token;
    } catch (error: any) {
      // Token refresh failed, logout user
      await this.logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roleName: string): boolean {
    const user = this.getStoredUser();
    if (!user || !user.userRoles) return false;
    
    return user.userRoles.some(userRole => userRole.role.name === roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(roleName => this.hasRole(roleName));
  }
}

export const authService = new AuthService();
export default authService;