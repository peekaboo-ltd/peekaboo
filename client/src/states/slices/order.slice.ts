import { createSlice } from '@reduxjs/toolkit';
import type { Order } from '../../types/order.type';

export interface OrderState {
  ordersList: Order[];
  order?: Order;
  selectedOrder?: Order;
}

const initialState: OrderState = {
  ordersList: [],
  order: undefined,
  selectedOrder: undefined,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrdersList: (state, action) => {
      state.ordersList = action.payload;
    },
    setOrder: (state, action) => {
      state.order = action.payload;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
});

export const { setOrdersList, setOrder, setSelectedOrder } = orderSlice.actions;

export default orderSlice.reducer;
