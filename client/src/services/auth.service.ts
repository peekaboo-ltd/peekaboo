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
      // TODO: Replace with actual API call when backend auth is implemented
      // Mock authentication for development
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Admin User',
        email: credentials.email,
        phoneNumber: '+1234567890',
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            id: '1',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            roleId: '1',
            role: {
              id: '1',
              name: 'ADMIN' as any,
              description: 'Administrator',
              label: 'Admin',
              status: 'ACTIVE' as any,
            }
          }
        ]
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      const response = { token: mockToken, user: mockUser };
      
      // Store token and user
      this.token = mockToken;
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      
      // Set auth header for future requests
      this.setAuthHeader(mockToken);

      // Handle remember me
      if (!credentials.rememberMe) {
        // If not remember me, store in sessionStorage instead
        sessionStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
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
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      const { token } = response.data;
      
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