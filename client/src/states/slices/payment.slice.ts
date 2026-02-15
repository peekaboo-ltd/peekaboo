import { Payment } from '@/types/payment.types';
import { createSlice } from '@reduxjs/toolkit';

export interface PaymentState {
  paymentsList: Payment[];
  adminPaymentsList: Payment[];
  payment?: Payment;
  selectedPayment?: Payment;
  updateStatusModal: boolean;
}

const initialState: PaymentState = {
  paymentsList: [],
  adminPaymentsList: [],
  payment: undefined,
  selectedPayment: undefined,
  updateStatusModal: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentsList: (state, action) => {
      state.paymentsList = action.payload;
    },
    setAdminPaymentsList: (state, action) => {
      state.adminPaymentsList = action.payload;
    },
    setAddToPaymentsList: (state, action) => {
      state.paymentsList.unshift(action.payload);
    },
    setPayment: (state, action) => {
      state.payment = action.payload;
    },
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
    setUpdateStatusModal: (state, action) => {
      state.updateStatusModal = action.payload;
    },
  },
});

export const {
  setPaymentsList,
  setAdminPaymentsList,
  setAddToPaymentsList,
  setPayment,
  setSelectedPayment,
  setUpdateStatusModal,
} = paymentSlice.actions;

export default paymentSlice.reducer;
