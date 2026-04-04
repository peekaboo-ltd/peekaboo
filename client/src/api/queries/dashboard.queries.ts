import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

type DashboardDateRangeParams = {
  startDate?: string;
  endDate?: string;
};

export const dashboardQueriesApiSlice = createApi({
  reducerPath: 'dashboardQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query({
      query: ({ startDate, endDate }: DashboardDateRangeParams = {}) => ({
        url: '/dashboard',
        params: { startDate, endDate },
      }),
    }),
    getOrderChartData: builder.query({
      query: ({ period, startDate, endDate }: { period?: string } & DashboardDateRangeParams = {}) => ({
        url: '/dashboard/charts/orders',
        params: { period, startDate, endDate },
      }),
    }),
    getRevenueChartData: builder.query({
      query: ({ period, startDate, endDate }: { period?: string } & DashboardDateRangeParams = {}) => ({
        url: '/dashboard/charts/revenue',
        params: { period, startDate, endDate },
      }),
    }),
    getDeliveryChartData: builder.query({
      query: ({ period, startDate, endDate }: { period?: string } & DashboardDateRangeParams = {}) => ({
        url: '/dashboard/charts/deliveries',
        params: { period, startDate, endDate },
      }),
    }),
    getSummaryChartData: builder.query({
      query: ({ metric, period, startDate, endDate }: { metric?: string; period?: string } & DashboardDateRangeParams = {}) => ({
        url: '/dashboard/charts/summary',
        params: { metric, period, startDate, endDate },
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
