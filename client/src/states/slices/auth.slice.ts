import { User } from '@/types/user.type';
import { localStorageUtil } from '@/utils/localStorage.util';
import { createSlice } from '@reduxjs/toolkit';

export interface InitialState {
  user?: User;
  token?: string;
  isAuthenticated?: boolean;
  sessionExpiredModal: boolean;
}

const initialState: InitialState = {
  user: localStorageUtil.getItem('user') as User | undefined,
  token: localStorageUtil.getItem('token') as string | undefined,
  isAuthenticated: localStorageUtil.getItem('token') ? true : false,
  sessionExpiredModal: false,
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
      localStorageUtil.removeItem('user');
      localStorageUtil.removeItem('token');
      window.location.href = '/auth/login';
    },
    setSessionExpiredModal: (state, action) => {
      state.sessionExpiredModal = action.payload;
    },
  },
});

export const { setUser, setToken, setIsAuthenticated, setLogout, setSessionExpiredModal } = authSlice.actions;

export default authSlice.reducer;
