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
  }),
});

export const { useGetDashboardMetricsQuery, useLazyGetDashboardMetricsQuery } =
  dashboardQueriesApiSlice;
