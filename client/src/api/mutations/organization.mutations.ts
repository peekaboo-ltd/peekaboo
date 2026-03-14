import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '..';
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  ContactInquiryPayload,
  ContactInquiryResponse,
  ValidateOnboardingTokenResponse,
  CompleteOnboardingPayload,
  CompleteOnboardingResponse,
  InviteOrganizationPayload,
  InviteOrganizationResponse,
  Organization,
} from '@/types/organization.type';

export const organizationMutationApiSlice = createApi({
  reducerPath: 'organizationMutationApi',
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    // CREATE ORGANIZATION (B2B Registration)
    createOrganization: builder.mutation<
      CreateOrganizationResponse,
      CreateOrganizationPayload
    >({
      query: (data) => ({
        url: '/organizations/register',
        method: 'POST',
        body: data,
      }),
    }),

    // CONTACT INQUIRY (Landing page)
    submitContactInquiry: builder.mutation<
      ContactInquiryResponse,
      ContactInquiryPayload
    >({
      query: (data) => ({
        url: '/organizations/contact',
        method: 'POST',
        body: data,
      }),
    }),

    // VALIDATE ONBOARDING TOKEN
    validateOnboardingToken: builder.query<
      ValidateOnboardingTokenResponse,
      string
    >({
      query: (token) => ({
        url: `/organizations/onboarding/${token}`,
        method: 'GET',
      }),
    }),

    // COMPLETE ONBOARDING
    completeOnboarding: builder.mutation<
      CompleteOnboardingResponse,
      CompleteOnboardingPayload
    >({
      query: (data) => ({
        url: '/organizations/complete-onboarding',
        method: 'POST',
        body: data,
      }),
    }),

    // INVITE ORGANIZATION
    inviteOrganization: builder.mutation<
      InviteOrganizationResponse,
      InviteOrganizationPayload
    >({
      query: (data) => ({
        url: '/organizations/invite',
        method: 'POST',
        body: data,
      }),
    }),

    // UPDATE MY ORGANIZATION (BUSINESS USER)
    updateMyOrganization: builder.mutation<
      { message: string; data: Organization },
      Partial<Organization>
    >({
      query: (data) => ({
        url: '/organizations/me',
        method: 'PATCH',
        body: data,
      }),
    }),

    // UPDATE ORGANIZATION BY ID (ADMIN)
    updateOrganization: builder.mutation<
      { message: string; data: Organization },
      { id: string; data: Partial<Organization> }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    // ASSIGN BUSINESS PLAN TO ORGANIZATION (ADMIN)
    assignBusinessPlan: builder.mutation<
      { message: string; data: Organization },
      { id: string; businessPlanId: string }
    >({
      query: ({ id, businessPlanId }) => ({
        url: `/organizations/${id}/business-plan`,
        method: 'PATCH',
        body: { businessPlanId },
      }),
    }),
  }),
});

export const {
  useCreateOrganizationMutation,
  useSubmitContactInquiryMutation,
  useValidateOnboardingTokenQuery,
  useCompleteOnboardingMutation,
  useInviteOrganizationMutation,
  useUpdateMyOrganizationMutation,
  useUpdateOrganizationMutation,
  useAssignBusinessPlanMutation,
} = organizationMutationApiSlice;
