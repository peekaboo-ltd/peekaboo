import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  OnboardingState,
  OrganizationFormData,
  AdminFormData,
  TeamMemberFormData,
} from '@/types/organization.type';
import { localStorageUtil } from '@/utils/localStorage.util';

const onboardingStorageKey = 'onboardingState';

const baseInitialState: OnboardingState = {
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

const loadPersistedState = (): OnboardingState => {
  if (typeof window === 'undefined') {
    return baseInitialState;
  }

  const persisted = localStorageUtil.getItem<Partial<OnboardingState>>(
    onboardingStorageKey
  );

  if (!persisted) {
    return baseInitialState;
  }

  return {
    ...baseInitialState,
    ...persisted,
    organization: {
      ...baseInitialState.organization,
      ...persisted.organization,
    },
    admin: {
      ...baseInitialState.admin,
      ...persisted.admin,
    },
    teamMembers: persisted.teamMembers ?? baseInitialState.teamMembers,
    currentStep: persisted.currentStep ?? baseInitialState.currentStep,
  };
};

const persistOnboardingState = (state: OnboardingState) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorageUtil.setItem(onboardingStorageKey, {
    organization: state.organization,
    admin: state.admin,
    teamMembers: state.teamMembers,
    currentStep: state.currentStep,
  });
};

const initialState: OnboardingState = loadPersistedState();

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
      persistOnboardingState(state);
    },
    setAdminData: (state, action: PayloadAction<AdminFormData>) => {
      state.admin = action.payload;
      state.currentStep = 3;
      persistOnboardingState(state);
    },
    setTeamMembers: (state, action: PayloadAction<TeamMemberFormData[]>) => {
      state.teamMembers = action.payload;
      persistOnboardingState(state);
    },
    setCurrentStep: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.currentStep = action.payload;
      persistOnboardingState(state);
    },
    resetOnboarding: () => {
      localStorageUtil.removeItem(onboardingStorageKey);
      return baseInitialState;
    },
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
