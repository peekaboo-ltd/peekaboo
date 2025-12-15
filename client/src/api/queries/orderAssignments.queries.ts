import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export interface AvailableRider {
  id: UUID;
  name?: string;
  email?: string;
  phoneNumber: string;
  distance: number | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  userRoles?: Array<{ role: { name: string } }>;
  activeOrderCount: number;
  isBusy: boolean;
  isOnline: boolean;
}

export const orderAssignmentsQueriesApiSlice = createApi({
  reducerPath: 'orderAssignmentsQueriesApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['OrderAssignments', 'AvailableRiders'],
  endpoints: (builder) => ({
    // FETCH AVAILABLE RIDERS
    fetchAvailableRiders: builder.query<
      { data: AvailableRider[] },
      { latitude: number; longitude: number; limit?: number }
    >({
      query: ({ latitude, longitude, limit = 10 }) => ({
        url: '/order-assignments/available-riders',
        params: { latitude, longitude, limit },
      }),
      providesTags: ['AvailableRiders'],
    }),

    // FETCH ORDER ASSIGNMENTS
    fetchOrderAssignments: builder.query({
      query: ({ page = 1, size = 10, orderId, assignedToId, status }: {
        page?: number;
        size?: number;
        orderId?: UUID;
        assignedToId?: UUID;
        status?: string;
      }) => ({
        url: '/order-assignments',
        params: { page, size, orderId, assignedToId, status },
      }),
      providesTags: ['OrderAssignments'],
    }),
  }),
});

export const {
  useFetchAvailableRidersQuery,
  useLazyFetchAvailableRidersQuery,
  useFetchOrderAssignmentsQuery,
} = orderAssignmentsQueriesApiSlice;
