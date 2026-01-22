import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import { type UUID } from '../../types/base';

export const ordersQueriesApiSlice = createApi({
  reducerPath: 'ordersQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchOrders: builder.query({
      query: ({
        page,
        size,
        createdById,
        senderId,
        recipientId,
        status,
        statusGroup,
        referenceId,
      }: {
        page: number;
        size: number;
        createdById?: UUID;
        senderId?: UUID;
        recipientId?: UUID;
        status?: string;
        statusGroup?: 'recent' | 'pending' | 'active' | 'completed';
        referenceId?: string;
      }) => {
        return {
          url: '/orders',
          params: {
            page,
            size,
            createdById,
            senderId,
            recipientId,
            status,
            statusGroup,
            referenceId,
          },
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

    // GET ORDER BY REFERENCE ID (PUBLIC)
    getOrderByReferenceId: builder.query({
      query: ({ referenceId }: { referenceId: string }) => `/orders/public/reference/${referenceId}`,
    }),
  }),
});

export const { useLazyFetchOrdersQuery, useLazyGetOrderQuery, useLazyGetOrderTrackingQuery, useLazyGetOrderByReferenceIdQuery } = ordersQueriesApiSlice;
