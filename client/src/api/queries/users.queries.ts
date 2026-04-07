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
    fetchRiderManagementPerformance: builder.query({
      query: ({
        page,
        size,
        search,
        status,
        timeframe,
        startDate,
        endDate,
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
        sortBy?: 'deliveries' | 'earnings' | 'canceled' | 'failed' | 'activeDays' | 'activeHours';
        sortOrder?: 'asc' | 'desc';
      }) => ({
        url: '/users/rider-management/performance',
        params: {
          page,
          size,
          search,
          status,
          timeframe,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        },
      }),
    }),
    fetchRiderManagementAttendance: builder.query({
      query: ({
        page,
        size,
        attendanceDate,
        name,
        riderId,
      }: {
        page: number;
        size: number;
        attendanceDate?: string;
        name?: string;
        riderId?: string;
      }) => ({
        url: '/users/rider-management/attendance',
        params: {
          page,
          size,
          attendanceDate,
          name,
          riderId,
        },
      }),
    }),
    fetchRiderManagementProblemReports: builder.query({
      query: ({
        page,
        size,
        attendanceDate,
        riderId,
      }: {
        page: number;
        size: number;
        attendanceDate?: string;
        riderId?: string;
      }) => ({
        url: '/users/rider-management/problem-reports',
        params: {
          page,
          size,
          attendanceDate,
          riderId,
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
  useLazyFetchRiderManagementPerformanceQuery,
  useLazyFetchRiderManagementAttendanceQuery,
  useLazyFetchRiderManagementProblemReportsQuery,
  useLazyFetchUserCurrentLocationHistoryQuery,
} = usersQueriesApiSlice;
