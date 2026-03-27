import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'tailor' | 'seller' | 'delivery' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sheetOpen: boolean;
  sheetMode: 'login' | 'register';
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  sheetOpen: false,
  sheetMode: 'login',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      { payload }: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>,
    ) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    openAuthSheet(state, { payload }: PayloadAction<'login' | 'register' | undefined>) {
      state.sheetOpen = true;
      if (payload) state.sheetMode = payload;
    },
    closeAuthSheet(state) {
      state.sheetOpen = false;
    },
    setSheetMode(state, { payload }: PayloadAction<'login' | 'register'>) {
      state.sheetMode = payload;
    },
  },
});

export const { setCredentials, clearCredentials, openAuthSheet, closeAuthSheet, setSheetMode } =
  authSlice.actions;
export default authSlice.reducer;
