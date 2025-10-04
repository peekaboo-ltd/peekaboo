import { ENVIRONMENTS } from '@/constants/environments.constants';
import { localStorageUtil } from '@/utils/localStorage.util';
import type { AuthUser } from '@/states/slices/auth.slice';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  withAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = ENVIRONMENTS.API_URL;
  const url = `${baseUrl}${path}`;
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (options.withAuth !== false) {
    const token = localStorageUtil.getItem<string>('token') ?? sessionStorage.getItem('token');
    if (token) headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    // try refresh once
    try {
      const refresh = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (refresh.ok) {
        const data = (await refresh.json()) as { token: string };
        if (data?.token) {
          try {
            localStorage.setItem('token', data.token);
          } catch {
            sessionStorage.setItem('token', data.token);
          }
          // retry original request once
          return await request<T>(path, options);
        }
      }
    } catch {
      // fall-through to error
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      message = err?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'ADMIN' | 'RIDER' | 'CUSTOMER';
}

export interface LoginResponse {
  message?: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface MeResponse {
  message?: string;
  data: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
    const res = await request<LoginResponse>('/auth/login', { method: 'POST', body: payload, withAuth: false });
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<void> {
    await request('/auth/register', { method: 'POST', body: payload, withAuth: false });
  },

  async getCurrentUser(): Promise<AuthUser> {
    const res = await request<MeResponse>('/auth/me', { method: 'GET' });
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } catch {}
  },
};
