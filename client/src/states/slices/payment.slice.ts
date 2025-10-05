import { Payment } from '@/types/payment.types';
import { createSlice } from '@reduxjs/toolkit';

export interface PaymentState {
  paymentsList: Payment[];
  payment?: Payment;
  selectedPayment?: Payment;
}

const initialState: PaymentState = {
  paymentsList: [],
  payment: undefined,
  selectedPayment: undefined,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentsList: (state, action) => {
      state.paymentsList = action.payload;
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
  },
});

export const { setPaymentsList, setAddToPaymentsList, setPayment, setSelectedPayment } =
  paymentSlice.actions;

export default paymentSlice.reducer;
