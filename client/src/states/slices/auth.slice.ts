import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { localStorageUtil } from '@/utils/localStorage.util';

export type RoleType = 'ADMIN' | 'RIDER' | 'CUSTOMER' | 'STAFF';

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  roles: RoleType[];
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialAuthState = (): AuthState => {
  const storedUser = localStorageUtil.getItem<AuthUser>('auth_user');
  const storedToken = ((): string | null => {
    const local = localStorageUtil.getItem<string>('token');
    if (local) return local;
    try {
      return sessionStorage.getItem('token');
    } catch {
      return null;
    }
  })();

  return {
    user: storedUser ?? null,
    token: storedToken ?? null,
    isAuthenticated: Boolean(storedToken),
    loading: false,
    error: null,
  };
}

const initialState: AuthState = getInitialAuthState();

type LoginSuccessPayload = {
  user: AuthUser;
  token: string;
  remember?: boolean;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      const { user, token, remember } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Persist
      localStorageUtil.setItem('auth_user', user);
      try {
        if (remember) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
          // Ensure local token is cleared when not remembered
          localStorage.removeItem('token');
        }
      } catch {
        // ignore storage errors
      }
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      if (action.payload) localStorageUtil.setItem('auth_user', action.payload);
      else localStorageUtil.removeItem('auth_user');
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      try {
        if (action.payload) {
          localStorage.setItem('token', action.payload);
        } else {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      try {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } catch {}
      localStorageUtil.removeItem('auth_user');
    },
  },
});

export const { setLoading, setError, loginSuccess, setUser, setToken, logout } = authSlice.actions;

export default authSlice.reducer;
