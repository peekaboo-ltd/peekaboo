import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export const orderActivityQueriesApiSlice = createApi({
  reducerPath: 'orderActivityQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // FETCH PUBLIC ORDER ACTIVITIES (no auth required)
    fetchPublicOrderActivities: builder.query({
      query: ({
        page,
        size,
        orderId,
      }: {
        page?: number;
        size?: number;
        orderId: UUID;
      }) => ({
        url: '/order-activities/public',
        params: { page, size, orderId },
      }),
    }),

    fetchOrderActivities: builder.query({
      query: ({
        page,
        size,
        orderId,
      }: {
        page?: number;
        size?: number;
        orderId?: UUID;
      }) => ({
        url: '/order-activities',
        params: { page, size, orderId },
      }),
    }),
  }),
});

export const { useLazyFetchPublicOrderActivitiesQuery, useLazyFetchOrderActivitiesQuery } =
  orderActivityQueriesApiSlice;
