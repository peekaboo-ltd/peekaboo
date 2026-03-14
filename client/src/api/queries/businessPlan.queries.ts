import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { BusinessPlan, BusinessPlanOrganizationCountResponse, PaginatedBusinessPlansResponse } from '@/types/businessPlan.type';

export const businessPlanQueriesApiSlice = createApi({
  reducerPath: 'businessPlanQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchBusinessPlans: builder.query<
      PaginatedBusinessPlansResponse,
      { page?: number; size?: number } | void
    >({
      query: (params) => ({
        url: '/business-plans',
        params: { page: params?.page ?? 1, size: params?.size ?? 100 },
      }),
    }),

    fetchBusinessPlanById: builder.query<{ message: string; data: BusinessPlan }, string>({
      query: (id) => ({
        url: `/business-plans/${id}`,
      }),
    }),

    fetchBusinessPlanOrganizationCount: builder.query<BusinessPlanOrganizationCountResponse, string>({
      query: (id) => ({
        url: `/business-plans/${id}/organization-count`,
      }),
    }),
  }),
});

export const {
  useFetchBusinessPlansQuery,
  useLazyFetchBusinessPlansQuery,
  useFetchBusinessPlanByIdQuery,
  useFetchBusinessPlanOrganizationCountQuery,
} = businessPlanQueriesApiSlice;
