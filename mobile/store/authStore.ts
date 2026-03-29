import { create } from 'zustand';
import { User, LoginCredentials } from '../types';
import { authAPI } from '../services/api/auth';
import { 
  saveToken, 
  saveUserData, 
  clearAllData, 
  getToken, 
  getUserData 
} from '../services/storage/secureStorage';
import { handleAPIError, getErrorMessage } from '../utils/errorHandler';
import {
  disableCurrentPushSubscription,
  syncPushSubscription,
} from '../services/notifications/pushNotifications';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authAPI.login(credentials);
      
      // Save to secure storage
      await saveToken(response.token);
      await saveUserData(response.user);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      void syncPushSubscription();

      return true;
    } catch (error) {
      const appError = handleAPIError(error);
      set({
        isLoading: false,
        error: getErrorMessage(appError),
        isAuthenticated: false,
      });
      return false;
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true });
    
    try {
      await disableCurrentPushSubscription();

      // Try to logout from server (optional - might fail if token expired)
      await authAPI.logout().catch(() => {});
    } finally {
      // Always clear local data
      await clearAllData();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async (): Promise<boolean> => {
    set({ isLoading: true });
    
    try {
      const token = await getToken();
      const userData = await getUserData();
      
      if (!token) {
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
        return false;
      }
      
      // If we have cached user data, use it temporarily
      if (userData) {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        });
      }
      
      // Verify token with server
      try {
        const user = await authAPI.getProfile();
        await saveUserData(user);
        
        set({
          user: user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
        });

        void syncPushSubscription();

        return true;
      } catch (error) {
        // Token might be invalid
        await clearAllData();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      });
      return false;
    }
  },

  setUser: (user: User): void => {
    set({ user });
    saveUserData(user).catch(console.error);
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
