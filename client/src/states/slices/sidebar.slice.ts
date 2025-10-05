import { createSlice } from '@reduxjs/toolkit';

export interface InitialState {
  isOpen: boolean;
}

const initialState: InitialState = {
  isOpen: localStorage.getItem('sidebarOpen') === 'true',
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setIsOpen } = sidebarSlice.actions;

export default sidebarSlice.reducer;
