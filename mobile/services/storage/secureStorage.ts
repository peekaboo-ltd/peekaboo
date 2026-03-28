import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../../utils/constants';
import { User } from '../../types';

// Check if we're on web platform
const isWeb = Platform.OS === 'web';

// Web fallback using localStorage
const webStorage = {
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  getItem: (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

/**
 * Save auth token securely
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

/**
 * Get auth token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return await webStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove auth token
 */
export const removeToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

/**
 * Save refresh token securely
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return await webStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    }
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Remove refresh token
 */
export const removeRefreshToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    }
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
};

/**
 * Save user data
 */
export const saveUserData = async (user: User): Promise<void> => {
  try {
    const userString = JSON.stringify(user);
    if (isWeb) {
      await webStorage.setItem(STORAGE_KEYS.USER_DATA, userString);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, userString);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUserData = async (): Promise<User | null> => {
  try {
    const data = isWeb
      ? await webStorage.getItem(STORAGE_KEYS.USER_DATA)
      : await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUserData = async (): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    }
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

/**
 * Clear all stored data (logout)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await Promise.all([
      removeToken(),
      removeRefreshToken(),
      removeUserData(),
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};

/**
 * Save language preference
 */
export const saveLanguagePreference = async (language: 'en' | 'rw'): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.LANGUAGE, language);
    }
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

/**
 * Get saved language preference
 */
export const getLanguagePreference = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return await webStorage.getItem(STORAGE_KEYS.LANGUAGE);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.LANGUAGE);
  } catch (error) {
    console.error('Error getting language preference:', error);
    return null;
  }
};
