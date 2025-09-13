import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const externalMutationsApiSlice = createApi({
  reducerPath: 'externalMutationsApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    getAdministrativeDivisions: builder.mutation({
      query: ({ lat, lng }: { lat: number | null; lng: number | null }) => ({
        url: `https://menya.fly.dev/api/boundaries`,
        method: 'POST',
        body: { lat, lng },
      }),
    }),
  }),
});

export const { useGetAdministrativeDivisionsMutation } =
  externalMutationsApiSlice;
