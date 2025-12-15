import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENVIRONMENTS } from '../constants/environments.constants';

const prepareHeaders = async (headers: Headers) => {
  headers.set('content-type', 'application/json');
  return headers;
};

export const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: ENVIRONMENTS.API_URL,
    prepareHeaders,
    credentials: 'include',
  });
};
