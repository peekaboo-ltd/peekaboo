import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { UUID } from '@/types';

export const orderActivityQueriesApiSlice = createApi({
  reducerPath: 'orderActivityQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
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

export const { useLazyFetchOrderActivitiesQuery } =
  orderActivityQueriesApiSlice;
