import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENVIRONMENTS } from '../constants/environments.constants';
import { localStorageUtil } from '../utils/localStorage.util';

export const createBaseQuery = () => {
  return (endpoint: { url: string; method?: string; body?: unknown }, api: unknown, extra: unknown) => {
    const isFormData = endpoint?.body instanceof FormData;
    return fetchBaseQuery({
      baseUrl: ENVIRONMENTS.API_URL,
      prepareHeaders: (headers: Headers) => {
        const token = localStorageUtil.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        if (!isFormData) {
          headers.set('content-type', 'application/json');
        }
        return headers;
      },
    })(endpoint, api, extra);
  };
};
