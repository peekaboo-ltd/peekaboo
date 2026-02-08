import { createSlice } from '@reduxjs/toolkit';
import type { Order } from '../../types/order.type';

export interface OrderState {
  ordersList: Order[];
  order?: Order;
  selectedOrder?: Order;
  updateOrderLocationFromModal: boolean;
  updateOrderLocationToModal: boolean;
  orderPaymentModal: boolean;
  createOrderModal: boolean;
  deleteOrderModal: boolean;
}

const initialState: OrderState = {
  ordersList: [],
  order: undefined,
  selectedOrder: undefined,
  updateOrderLocationFromModal: false,
  updateOrderLocationToModal: false,
  orderPaymentModal: false,
  createOrderModal: false,
  deleteOrderModal: false,
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
    setUpdateOrderLocationFromModal: (state, action) => {
      state.updateOrderLocationFromModal = action.payload;
    },
    setUpdateOrderLocationToModal: (state, action) => {
      state.updateOrderLocationToModal = action.payload;
    },
    setOrderPaymentModal: (state, action) => {
      state.orderPaymentModal = action.payload;
    },
    setCreateOrderModal: (state, action) => {
      state.createOrderModal = action.payload;
    },
    setDeleteOrderModal: (state, action) => {
      state.deleteOrderModal = action.payload;
    },
  },
});

export const {
  setOrdersList,
  setOrder,
  setSelectedOrder,
  setUpdateOrderLocationFromModal,
  setUpdateOrderLocationToModal,
  setOrderPaymentModal,
  setCreateOrderModal,
  setDeleteOrderModal,
} = orderSlice.actions;

export default orderSlice.reducer;
