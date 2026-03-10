import { configureStore } from "@reduxjs/toolkit";
import recordingsReducer from "./recordingsSlice";

export const store = configureStore({
  reducer: {
    recordings: recordingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
