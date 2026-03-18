import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type { BusinessPlan } from '@/types/businessPlan.type';

export const businessPlanQueriesApiSlice = createApi({
  reducerPath: 'businessPlanQueriesApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    fetchBusinessPlans: builder.query<{ data: { rows: BusinessPlan[] } }, { page?: number; size?: number } | void>({
      query: (params) => ({
        url: '/business-plans',
        params: { page: params?.page ?? 1, size: params?.size ?? 100 },
      }),
    }),

    fetchBusinessPlanById: builder.query<{ data: BusinessPlan }, string>({
      query: (id) => ({
        url: `/business-plans/${id}`,
      }),
    }),

    fetchBusinessPlanOrganizationCount: builder.query<{ data: { count: number } }, string>({
      query: (id) => ({
        url: `/business-plans/${id}/organization-count`,
      }),
    }),

    fetchPublicBusinessPlans: builder.query<{ data: BusinessPlan[] }, void>({
      query: () => ({
        url: '/business-plans/public',
      }),
    }),

    fetchPublicBusinessPlanBySlug: builder.query<{ data: BusinessPlan }, string>({
      query: (slug) => ({
        url: `/business-plans/public/${slug}`,
      }),
    }),
  }),
});

export const {
  useFetchBusinessPlansQuery,
  useLazyFetchBusinessPlansQuery,
  useFetchBusinessPlanByIdQuery,
  useFetchBusinessPlanOrganizationCountQuery,
  useFetchPublicBusinessPlansQuery,
  useFetchPublicBusinessPlanBySlugQuery,
} = businessPlanQueriesApiSlice;
