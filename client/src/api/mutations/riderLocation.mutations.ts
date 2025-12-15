import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export interface UpdateLocationPayload {
  latitude: number;
  longitude: number;
  isOnline?: boolean;
}

export interface RiderLocationResponse {
  data: {
    id: string;
    riderId: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
    lastUpdated: string;
  };
}

export const riderLocationMutationsApiSlice = createApi({
  reducerPath: 'riderLocationMutationsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['RiderLocation'],
  endpoints: (builder) => ({
    // UPDATE RIDER LOCATION
    updateRiderLocation: builder.mutation<RiderLocationResponse, UpdateLocationPayload>({
      query: (payload) => ({
        url: '/rider-locations/update',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['RiderLocation'],
    }),

    // SET RIDER OFFLINE
    setRiderOffline: builder.mutation<RiderLocationResponse, void>({
      query: () => ({
        url: '/rider-locations/offline',
        method: 'POST',
      }),
      invalidatesTags: ['RiderLocation'],
    }),
  }),
});

export const {
  useUpdateRiderLocationMutation,
  useSetRiderOfflineMutation,
} = riderLocationMutationsApiSlice;
