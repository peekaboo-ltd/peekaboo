import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENVIRONMENTS } from '../constants/environments.constants';
import { localStorageUtil } from '../utils/localStorage.util';

const prepareHeaders = (headers: Headers) => {
  let token = localStorageUtil.getItem('token');
  if (!token) {
    try {
      token = sessionStorage.getItem('token');
    } catch {
      // ignore
    }
  }
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  headers.set('content-type', 'application/json');
  return headers;
};

export const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: ENVIRONMENTS.API_URL,
    prepareHeaders,
  });
};
