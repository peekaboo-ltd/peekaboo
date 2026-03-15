import { BusinessPlan } from '@/types/businessPlan.type';
import { createSlice } from '@reduxjs/toolkit'

export interface BusinessPlanState {
    businessPlansList: BusinessPlan[];
    selectedBusinessPlan?: BusinessPlan;
    businessPlan?: BusinessPlan;
}

const initialState: BusinessPlanState = {
    businessPlansList: [],
    selectedBusinessPlan: undefined,
    businessPlan: undefined,
}

const businessPlanSlice = createSlice({
    name: 'businessPlan',
    initialState,
    reducers: {
        setBusinessPlansList: (state, action) => {
            state.businessPlansList = action.payload;
        },
        setSelectedBusinessPlan: (state, action) => {
            state.selectedBusinessPlan = action.payload;
        },
        setBusinessPlan: (state, action) => {
            state.businessPlan = action.payload;
        },
    }
});

export const {
    setBusinessPlansList,
    setSelectedBusinessPlan,
    setBusinessPlan,
} = businessPlanSlice.actions

export default businessPlanSlice.reducer;
