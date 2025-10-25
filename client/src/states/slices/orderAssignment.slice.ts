import { createSlice } from '@reduxjs/toolkit';
import type { OrderAssignment } from '../../types/orderAssignment.type';

export interface OrderAssignmentState {
  orderAssignmentsList: OrderAssignment[];
  orderAssignment?: OrderAssignment;
  selectedOrderAssignment?: OrderAssignment;
  acceptOrderAssignmentModal: boolean;
  rejectOrderAssignmentModal: boolean;
  reassignOrderAssignmentModal: boolean;
}

const initialState: OrderAssignmentState = {
  orderAssignmentsList: [],
  orderAssignment: undefined,
  selectedOrderAssignment: undefined,
  acceptOrderAssignmentModal: false,
  rejectOrderAssignmentModal: false,
  reassignOrderAssignmentModal: false,
};

const orderAssignmentSlice = createSlice({
  name: 'orderAssignment',
  initialState,
  reducers: {
    setOrderAssignmentsList: (state, action) => {
      state.orderAssignmentsList = action.payload;
    },
    setOrderAssignment: (state, action) => {
      state.orderAssignment = action.payload;
    },
    setSelectedOrderAssignment: (state, action) => {
      state.selectedOrderAssignment = action.payload;
    },
    setAcceptOrderAssignmentModal: (state, action) => {
      state.acceptOrderAssignmentModal = action.payload;
    },
    setRejectOrderAssignmentModal: (state, action) => {
      state.rejectOrderAssignmentModal = action.payload;
    },
    setReassignOrderAssignmentModal: (state, action) => {
      state.reassignOrderAssignmentModal = action.payload;
    },
  },
});

export const {
  setOrderAssignmentsList,
  setOrderAssignment,
  setSelectedOrderAssignment,
  setAcceptOrderAssignmentModal,
  setRejectOrderAssignmentModal,
  setReassignOrderAssignmentModal,
} = orderAssignmentSlice.actions;

export default orderAssignmentSlice.reducer;
