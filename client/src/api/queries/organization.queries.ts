import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { Organization } from '@/types/organization.type';
import { UUID } from '@/types';
import { BillingPeriod } from '@/types/organization.type';

interface BillingQueryParams {
  page?: number;
  size?: number;
  status?: string;
  billingPeriod?: BillingPeriod;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface OrganizationOrdersQueryParams {
  page?: number;
  size?: number;
  status?: string;
}

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

    fetchMyBillingHistory: builder.query({
      query: (params: BillingQueryParams | void) => ({
        url: '/organizations/me/billing',
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
          status: params?.status,
          billingPeriod: params?.billingPeriod,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
    }),

    fetchMyBillingSummary: builder.query({
      query: () => ({
        url: '/organizations/me/billing/summary',
      }),
    }),

    fetchAllBillings: builder.query({
      query: (params: BillingQueryParams | void) => ({
        url: '/organizations/billing/all',
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 100,
          status: params?.status,
          billingPeriod: params?.billingPeriod,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
    }),

    fetchOrganizationBillingHistory: builder.query({
      query: ({
        organizationId,
        ...params
      }: BillingQueryParams & { organizationId: UUID }) => ({
        url: `/organizations/${organizationId}/billing`,
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          status: params?.status,
          billingPeriod: params?.billingPeriod,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
    }),

    fetchMyOrganizationOrders: builder.query({
      query: (params: OrganizationOrdersQueryParams | void) => ({
        url: '/organizations/me/orders',
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          status: params?.status,
        },
      }),
    }),

    fetchOrganizationOrders: builder.query({
      query: ({
        organizationId,
        ...params
      }: OrganizationOrdersQueryParams & { organizationId: UUID }) => ({
        url: `/organizations/${organizationId}/orders`,
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          status: params?.status,
        },
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
  useFetchMyBillingHistoryQuery,
  useLazyFetchMyBillingHistoryQuery,
  useFetchMyBillingSummaryQuery,
  useLazyFetchMyBillingSummaryQuery,
  useFetchAllBillingsQuery,
  useLazyFetchAllBillingsQuery,
  useFetchOrganizationBillingHistoryQuery,
  useLazyFetchOrganizationBillingHistoryQuery,
  useFetchMyOrganizationOrdersQuery,
  useLazyFetchMyOrganizationOrdersQuery,
  useFetchOrganizationOrdersQuery,
  useLazyFetchOrganizationOrdersQuery,
} = organizationQueriesApiSlice;
