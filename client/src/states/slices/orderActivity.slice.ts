import type { OrderActivity } from '@/types/orderActivity.type';
import { createSlice } from '@reduxjs/toolkit';

export interface OrderActivityState {
  orderActivitiesList: OrderActivity[];
  orderActivity?: OrderActivity;
  selectedOrderActivity?: OrderActivity;
}

const initialState: OrderActivityState = {
  orderActivitiesList: [],
  orderActivity: undefined,
  selectedOrderActivity: undefined,
};

const orderActivitySlice = createSlice({
  name: 'orderActivity',
  initialState,
  reducers: {
    setOrderActivitiesList: (state, action) => {
      state.orderActivitiesList = action.payload;
    },
    setOrderActivity: (state, action) => {
      state.orderActivity = action.payload;
    },
    setSelectedOrderActivity: (state, action) => {
      state.selectedOrderActivity = action.payload;
    },
  },
});

export const {
  setOrderActivitiesList,
  setOrderActivity,
  setSelectedOrderActivity,
} = orderActivitySlice.actions;

export default orderActivitySlice.reducer;
