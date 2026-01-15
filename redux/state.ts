// redux/state.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProgramSlug } from "@/lib/programs";

type Direction = "ltr" | "rtl";

export interface AppState {
  direction: Direction;
  isRTL: boolean;
  activeProgram: ProgramSlug | null;
}

const initialState: AppState = {
  direction: "ltr",
  isRTL: false,
  activeProgram: null,
};

const appState = createSlice({
  name: "state",
  initialState,
  reducers: {
    initializeDirection(state, action: PayloadAction<Direction>) {
      state.direction = action.payload;
      state.isRTL = action.payload === "rtl";
    },
    setDirection(state, action: PayloadAction<Direction>) {
      state.direction = action.payload;
      state.isRTL = action.payload === "rtl";
    },
    setActiveProgram(state, action: PayloadAction<ProgramSlug | null>) {
      state.activeProgram = action.payload;
    },
  },
});

export const { initializeDirection, setDirection, setActiveProgram } =
  appState.actions;
export default appState.reducer;
