import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const authQueriesApiSlice = createApi({
  reducerPath: 'authQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    checkAccount: builder.query<{ hasEmail: boolean; hasPassword: boolean }, void>({
      query: () => ({
        url: '/auth/check-account',
        method: 'GET',
      }),
    }),
  }),
});

export const { useLazyCheckAccountQuery } = authQueriesApiSlice;
