import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { PublicPaymentStatus } from '@/types/payment.types';

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
    // FETCH PUBLIC PAYMENTS (no auth required)
    fetchPublicPayments: builder.query({
      query: ({ entityId, paymentType }: { entityId: string; paymentType?: string }) => ({
        url: `/payments/public`,
        method: 'GET',
        params: { entityId, paymentType },
      }),
    }),

    getPublicPaymentStatus: builder.query<
      { message: string; data: PublicPaymentStatus },
      { paymentId: string; entityId: string }
    >({
      query: ({ paymentId, entityId }) => ({
        url: `/payments/public/${paymentId}/status`,
        method: 'GET',
        params: { entityId },
      }),
    }),

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
    fetchProviderBalance: builder.query<{ message: string; data: Record<string, unknown> }, void>({
      query: () => ({
        url: `/payments/admin/balance`,
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
  useLazyFetchPublicPaymentsQuery,
  useGetPublicPaymentStatusQuery,
  useLazyFetchPaymentsQuery,
  useLazyGetPaymentQuery,
  useLazyFetchAdminPaymentsQuery,
  useLazyFetchPaymentStatsQuery,
  useLazyExportPaymentsQuery,
  useLazyFetchProviderBalanceQuery,
} = paymentsQueriesApiSlice;
