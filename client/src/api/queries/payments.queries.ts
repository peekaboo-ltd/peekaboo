import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const paymentsQueriesApiSlice = createApi({
  reducerPath: 'paymentsQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchPayments: builder.query({
      query: ({ entityId, paymentType }) => ({
        url: `/payments`,
        method: 'GET',
        params: { entityId, paymentType },
      }),
    }),
  }),
});

export const { useLazyFetchPaymentsQuery } = paymentsQueriesApiSlice;
