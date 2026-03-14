import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { Organization, PaginatedOrganizationsResponse, PaginatedMembersResponse } from '@/types/organization.type';

export const organizationQueriesApiSlice = createApi({
  reducerPath: 'organizationQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchMyOrganization: builder.query<{ message: string; data: Organization }, void>({
      query: () => ({
        url: '/organizations/me',
      }),
    }),

    fetchOrganizations: builder.query<
      PaginatedOrganizationsResponse,
      { page?: number; size?: number }
    >({
      query: ({ page = 1, size = 20 } = {}) => ({
        url: '/organizations',
        params: { page, size },
      }),
    }),

    fetchOrganizationById: builder.query<{ message: string; data: Organization }, string>({
      query: (id) => ({
        url: `/organizations/${id}`,
      }),
    }),

    fetchOrganizationMembers: builder.query<
      PaginatedMembersResponse,
      { id: string; page?: number; size?: number }
    >({
      query: ({ id, page = 1, size = 50 }) => ({
        url: `/organizations/${id}/members`,
        params: { page, size },
      }),
    }),
  }),
});

export const {
  useLazyFetchMyOrganizationQuery,
  useFetchMyOrganizationQuery,
  useLazyFetchOrganizationsQuery,
  useFetchOrganizationsQuery,
  useLazyFetchOrganizationByIdQuery,
  useFetchOrganizationByIdQuery,
  useLazyFetchOrganizationMembersQuery,
  useFetchOrganizationMembersQuery,
} = organizationQueriesApiSlice;
