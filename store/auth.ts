// store/auth.ts
import { UserProfileDTO } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  user: UserProfileDTO | null;
  hydrated: boolean;
  sessionExpired: boolean;
};

const initialState: AuthState = {
  user: null,
  hydrated: false,
  sessionExpired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfileDTO | null>) {
      state.user = action.payload;
      state.hydrated = true;
      state.sessionExpired = false;
    },
    clearUser(state) {
      state.user = null;
      state.hydrated = true;
    },
    setSessionExpired(state, action: PayloadAction<boolean>) {
      state.sessionExpired = action.payload;
    },
    clearSessionExpired(state) {
      state.sessionExpired = false;
    },
  },
});

export const { setUser, clearUser, setSessionExpired, clearSessionExpired } =
  authSlice.actions;
export default authSlice.reducer;
