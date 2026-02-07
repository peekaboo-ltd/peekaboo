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
  }),
});

export const {
  useCreateOrganizationMutation,
  useSubmitContactInquiryMutation,
  useValidateOnboardingTokenQuery,
  useCompleteOnboardingMutation,
  useInviteOrganizationMutation,
} = organizationMutationApiSlice;
