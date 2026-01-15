// redux/auth.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  sessionExpired: boolean;
};

const initialState: AuthState = {
  sessionExpired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSessionExpired(state, action: PayloadAction<boolean>) {
      state.sessionExpired = action.payload;
    },
    clearSessionExpired(state) {
      state.sessionExpired = false;
    },
  },
});

export const { setSessionExpired, clearSessionExpired } = authSlice.actions;
export default authSlice.reducer;
