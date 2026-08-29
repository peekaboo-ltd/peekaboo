import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { LandingStats, SuggestedRider } from '@/types/landing.type';

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
    getSuggestedRider: builder.query<
      SuggestedRider | null,
      { latitude: number; longitude: number }
    >({
      query: ({ latitude, longitude }) => ({
        url: '/landing/suggested-rider',
        params: { latitude, longitude },
      }),
      transformResponse: (response: { data: SuggestedRider | null }) =>
        response.data ?? null,
    }),
  }),
});

export const { useGetLandingStatsQuery, useGetSuggestedRiderQuery } =
  landingQueriesApiSlice;
