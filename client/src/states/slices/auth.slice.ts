import { User } from '@/types/user.type';
import { createSlice } from '@reduxjs/toolkit';

export interface InitialState {
  user?: User;
  token?: string;
  isAuthenticated?: boolean;
}

const initialState: InitialState = {
  user: undefined, 
  token: undefined, 
  isAuthenticated: false, 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setLogout: (state) => {
      state.user = undefined;
      state.token = undefined;
      state.isAuthenticated = false;
      window.location.href = '/auth/login';
    },
  },
});

export const { setUser, setToken, setIsAuthenticated, setLogout } = authSlice.actions;

export default authSlice.reducer;
