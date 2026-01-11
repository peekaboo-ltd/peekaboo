import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types';

/**
 * Hook for authentication operations
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  /**
   * Login with credentials
   */
  const handleLogin = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    return await login(credentials);
  }, [login]);

  /**
   * Logout current user
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
  }, [logout]);

  /**
   * Check if user is authenticated
   */
  const handleCheckAuth = useCallback(async (): Promise<boolean> => {
    return await checkAuth();
  }, [checkAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    checkAuth: handleCheckAuth,
    clearError,
  };
};
