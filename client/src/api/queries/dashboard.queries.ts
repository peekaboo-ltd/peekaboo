import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const dashboardQueriesApiSlice = createApi({
  reducerPath: 'dashboardQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query({
      query: () => ({
        url: '/dashboard',
      }),
    }),
    getOrderChartData: builder.query({
      query: ({ period }: { period?: string }) => ({
        url: '/dashboard/charts/orders',
        params: { period },
      }),
    }),
    getRevenueChartData: builder.query({
      query: ({ period }: { period?: string }) => ({
        url: '/dashboard/charts/revenue',
        params: { period },
      }),
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useLazyGetDashboardMetricsQuery,
  useGetOrderChartDataQuery,
  useLazyGetOrderChartDataQuery,
  useGetRevenueChartDataQuery,
  useLazyGetRevenueChartDataQuery,
} = dashboardQueriesApiSlice;
