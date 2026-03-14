import { Organization } from '@/types/organization.type';
import { createSlice } from '@reduxjs/toolkit'

export interface OrganizationState {
  organizationsList: Organization[];
  organization?: Organization;
  selectedOrganization?: Organization;
}

const initialState: OrganizationState = {
  organizationsList: [],
  organization: undefined,
  selectedOrganization: undefined,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganizationsList: (state, action) => {
      state.organizationsList = action.payload;
    },
    setOrganization: (state, action) => {
      state.organization = action.payload;
    },
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
  },
});

export const {
  setOrganizationsList,
  setOrganization,
  setSelectedOrganization,
} = organizationSlice.actions;

export default organizationSlice.reducer