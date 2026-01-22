import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { LandingStats } from '@/types/landing.type';

export const landingQueriesApiSlice = createApi({
  reducerPath: 'landingQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    getLandingStats: builder.query<
      LandingStats,
      { orderStatus?: string } | void
    >({
      query: (args) => ({
        url: '/landing/stats',
        params: args?.orderStatus ? { orderStatus: args.orderStatus } : undefined,
      }),
      transformResponse: (response: { data: LandingStats }) => response.data,
    }),
  }),
});

export const { useGetLandingStatsQuery } = landingQueriesApiSlice;

