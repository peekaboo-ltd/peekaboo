import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  OnboardingState,
  OrganizationFormData,
  AdminFormData,
  TeamMemberFormData,
} from '@/types/organization.type';

const initialState: OnboardingState = {
  organization: {
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    industry: '',
    deliveryVolume: '',
  },
  admin: {
    name: '',
    email: '',
    phoneNumber: '',
    title: '',
    password: '',
    confirmPassword: '',
  },
  teamMembers: [
    { name: '', email: '' },
    { name: '', email: '' },
  ],
  currentStep: 1,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOrganizationData: (
      state,
      action: PayloadAction<OrganizationFormData>
    ) => {
      state.organization = action.payload;
      state.currentStep = 2;
    },
    setAdminData: (state, action: PayloadAction<AdminFormData>) => {
      state.admin = action.payload;
      state.currentStep = 3;
    },
    setTeamMembers: (state, action: PayloadAction<TeamMemberFormData[]>) => {
      state.teamMembers = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.currentStep = action.payload;
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setOrganizationData,
  setAdminData,
  setTeamMembers,
  setCurrentStep,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
