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
    getDeliveryChartData: builder.query({
      query: ({ period }: { period?: string }) => ({
        url: '/dashboard/charts/deliveries',
        params: { period },
      }),
    }),
    getSummaryChartData: builder.query({
      query: ({ metric, period }: { metric?: string; period?: string }) => ({
        url: '/dashboard/charts/summary',
        params: { metric, period },
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
  useGetDeliveryChartDataQuery,
  useLazyGetDeliveryChartDataQuery,
  useGetSummaryChartDataQuery,
  useLazyGetSummaryChartDataQuery,
} = dashboardQueriesApiSlice;
