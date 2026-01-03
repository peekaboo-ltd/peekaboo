import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../../types/user.type';

export interface UserState {
  usersList: User[];
  user?: User;
  selectedUser?: User;
  createUserModal: boolean;
  updateUserModal: boolean;
  deleteUserModal: boolean;
}

const initialState: UserState = {
  usersList: [],
  user: undefined,
  selectedUser: undefined,
  createUserModal: false,
  updateUserModal: false,
  deleteUserModal: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsersList: (state, action) => {
      state.usersList = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setCreateUserModal: (state, action) => {
      state.createUserModal = action.payload;
    },
    setUpdateUserModal: (state, action) => {
      state.updateUserModal = action.payload;
    },
    setDeleteUserModal: (state, action) => {
      state.deleteUserModal = action.payload;
    },
  },
});

export const {
  setUsersList,
  setUser,
  setSelectedUser,
  setCreateUserModal,
  setUpdateUserModal,
  setDeleteUserModal,
} = userSlice.actions;

export default userSlice.reducer;
