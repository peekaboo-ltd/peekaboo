import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import { type UUID } from '../../types/base';

export const ordersQueriesApiSlice = createApi({
  reducerPath: 'ordersQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchOrders: builder.query({
      query: ({ page, size }: { page: number; size: number }) => {
        return {
          url: '/orders',
          params: { page, size },
        };
      },
    }),
    getOrder: builder.query({
      query: ({ id }: { id: UUID }) => `/orders/${id}`,
    }),

    // GET ORDER TRACKING
    getOrderTracking: builder.query({
      query: ({ id }: { id: UUID }) => `/orders/${id}/tracking`,
    }),
  }),
});

export const { useLazyFetchOrdersQuery, useLazyGetOrderQuery, useLazyGetOrderTrackingQuery } = ordersQueriesApiSlice;
