import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';

export const usersQueriesApiSlice = createApi({
  reducerPath: 'usersQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchUsers: builder.query({
      query: ({
        page,
        size,
        search,
        roles,
        status,
        organizationId
      }: {
        page: number;
        size: number;
        search?: string;
        roles?: string[];
        status?: string;
        organizationId?: string;
      }) => {
        return {
          url: '/users',
          params: {
            search,
            page,
            size,
            roles: roles ? roles.join(',') : undefined,
            status,
            organizationId,
          },
        };
      },
    }),
    fetchUserById: builder.query({
      query: (id: string) => ({
        url: `/users/${id}`,
      }),
    }),
    fetchUsersTracking: builder.query({
      query: ({
        page,
        size,
        organizationId,
        roles,
      }: {
        page: number;
        size: number;
        organizationId?: string;
        roles?: string[];
      }) => ({
        url: '/users/tracking',
        params: {
          page,
          size,
          organizationId,
          roles: roles ? roles.join(',') : undefined,
        },
      }),
    }),
    fetchRiderManagement: builder.query({
      query: ({
        page,
        size,
        search,
        status,
        timeframe,
        startDate,
        endDate,
        attendanceDate,
        name,
        sortBy,
        sortOrder,
      }: {
        page: number;
        size: number;
        search?: string;
        status?: string;
        timeframe?: 'daily' | 'weekly' | 'monthly' | 'custom';
        startDate?: string;
        endDate?: string;
        attendanceDate?: string;
        name?: string;
        sortBy?: 'deliveries' | 'earnings' | 'canceled' | 'failed' | 'activeDays' | 'activeHours';
        sortOrder?: 'asc' | 'desc';
      }) => ({
        url: '/users/rider-management',
        params: {
          page,
          size,
          search,
          status,
          timeframe,
          startDate,
          endDate,
          attendanceDate,
          name,
          sortBy,
          sortOrder,
        },
      }),
    }),
    fetchUserCurrentLocationHistory: builder.query({
      query: ({
        userId,
        page,
        size,
        startTime,
        endTime,
      }: {
        userId: string;
        page: number;
        size: number;
        startTime?: string;
        endTime?: string;
      }) => ({
        url: `/users/${userId}/current-location-history`,
        params: {
          page,
          size,
          startTime,
          endTime,
        },
      }),
    }),
  }),
});

export const {
  useLazyFetchUsersQuery,
  useLazyFetchUserByIdQuery,
  useLazyFetchUsersTrackingQuery,
  useLazyFetchRiderManagementQuery,
  useLazyFetchUserCurrentLocationHistoryQuery,
} = usersQueriesApiSlice;
