import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

// Define User Type
export type User = {
  _id: string;
  email: string;
  exp: number;
  firstName: string;
  lastName: string;
  token_type: string;
  role: string;
};

// Define Auth State Type
type AuthState = {
  user: null | User;
  token: null | string;
};

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
};

// Create Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{user: User; token: string}>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: state => {
      state.user = null;
      state.token = null;
    },
  },
});

// Export Actions
export const {setUser, logout} = authSlice.actions;

// Export Reducer
export default authSlice.reducer;

// Selectors
export const useCurrentToken = (state: RootState) => state.auth.token;
export const useCurrentUser = (state: RootState) => state.auth.user;
