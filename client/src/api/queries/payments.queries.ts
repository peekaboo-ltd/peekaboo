import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export interface AdminPaymentsQueryParams {
  page?: number;
  size?: number;
  status?: string;
  currency?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchKey?: string;
}

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
    fetchAdminPayments: builder.query({
      query: (params: AdminPaymentsQueryParams) => ({
        url: `/payments/admin`,
        method: 'GET',
        params,
      }),
    }),
    fetchPaymentStats: builder.query({
      query: (params?: { startDate?: string; endDate?: string; currency?: string }) => ({
        url: `/payments/admin/stats`,
        method: 'GET',
        params,
      }),
    }),
    getPayment: builder.query({
      query: (id: string) => ({
        url: `/payments/${id}`,
        method: 'GET',
      }),
    }),
    exportPayments: builder.query({
      query: (params: AdminPaymentsQueryParams) => ({
        url: `/payments/admin/export`,
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useLazyFetchPaymentsQuery,
  useLazyGetPaymentQuery,
  useLazyFetchAdminPaymentsQuery,
  useLazyFetchPaymentStatsQuery,
  useLazyExportPaymentsQuery,
} = paymentsQueriesApiSlice;
