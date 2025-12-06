import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENVIRONMENTS } from '../constants/environments.constants';
// NextAuth removed - using AuthContextSecure instead

const prepareHeaders = async (headers: Headers) => {
  // Auth headers are now handled by AuthContextSecure in individual API calls
  // No global auth header injection needed
  headers.set('content-type', 'application/json');
  return headers;
};

export const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: ENVIRONMENTS.API_URL,
    prepareHeaders,
    credentials: 'include', // Include HTTP-only cookies
  });
};
