import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { Organization } from '@/types/organization.type';
import { UUID } from '@/types';

export const organizationQueriesApiSlice = createApi({
  reducerPath: 'organizationQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchMyOrganization: builder.query<{ message: string; data: Organization }, void>({
      query: () => ({
        url: '/organizations/me',
      }),
    }),

    fetchOrganizations: builder.query({
      query: ({ page = 0, size = 20 }: { page?: number; size?: number }) => ({
        url: '/organizations',
        params: { page, size },
      }),
    }),

    fetchOrganizationById: builder.query({
      query: (id: UUID) => ({
        url: `/organizations/${id}`,
      }),
    }),

    fetchOrganizationMembers: builder.query({
      query: ({ id, page = 0, size = 50 }: { id: UUID; page?: number; size?: number }) => ({
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
