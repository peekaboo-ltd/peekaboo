import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const paymentsMutationsApiSlice = createApi({
  reducerPath: 'paymentsMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (payment) => ({
        url: '/payments',
        method: 'POST',
        body: payment,
      }),
    }),
  }),
});

export const { useCreatePaymentMutation } = paymentsMutationsApiSlice;
