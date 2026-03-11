import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Recording } from "../api/recordings.mock";

interface RecordingsState {
  allItems: Recording[];
  loading: boolean;
  query: string;
  currentPage: number;
  pageSize: number;
  activeId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const initialState: RecordingsState = {
  allItems: [],
  loading: false,
  query: "",
  currentPage: 1,
  pageSize: 30,
  activeId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
};

const recordingsSlice = createSlice({
  name: "recordings",
  initialState,
  reducers: {
    setAllItems: (state, action: PayloadAction<Recording[]>) => {
      state.allItems = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setActiveId: (state, action: PayloadAction<string | null>) => {
      state.activeId = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    resetPlayer: (state) => {
      state.activeId = null;
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
    },
  },
});

export const {
  setAllItems,
  setLoading,
  setQuery,
  setCurrentPage,
  setPageSize,
  setActiveId,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  resetPlayer,
} = recordingsSlice.actions;

export default recordingsSlice.reducer;
