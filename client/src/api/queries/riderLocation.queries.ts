import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export interface RiderLocation {
  id: UUID;
  riderId: UUID;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  lastUpdated: string;
  rider?: {
    id: UUID;
    name?: string;
    phoneNumber: string;
  };
}

export const riderLocationQueriesApiSlice = createApi({
  reducerPath: 'riderLocationQueriesApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['RiderLocation'],
  endpoints: (builder) => ({
    // GET RIDER LOCATION BY ID
    getRiderLocation: builder.query<{ data: RiderLocation }, UUID>({
      query: (riderId) => `/rider-locations/${riderId}`,
      providesTags: ['RiderLocation'],
    }),

    // GET ALL ONLINE RIDERS
    getOnlineRiders: builder.query<{ data: RiderLocation[] }, void>({
      query: () => '/rider-locations',
      providesTags: ['RiderLocation'],
    }),
  }),
});

export const {
  useGetRiderLocationQuery,
  useLazyGetRiderLocationQuery,
  useGetOnlineRidersQuery,
} = riderLocationQueriesApiSlice;
