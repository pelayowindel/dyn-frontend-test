import type { RootState } from "./store";

export const selectAllItems = (state: RootState) => state.recordings.allItems;
export const selectLoading = (state: RootState) => state.recordings.loading;
export const selectQuery = (state: RootState) => state.recordings.query;
export const selectCurrentPage = (state: RootState) =>
  state.recordings.currentPage;
export const selectPageSize = (state: RootState) => state.recordings.pageSize;
export const selectActiveId = (state: RootState) => state.recordings.activeId;
export const selectIsPlaying = (state: RootState) => state.recordings.isPlaying;
export const selectCurrentTime = (state: RootState) =>
  state.recordings.currentTime;
export const selectDuration = (state: RootState) => state.recordings.duration;

export const selectTotalItems = (state: RootState) =>
  state.recordings.allItems.length;

export const selectTotalPages = (state: RootState) =>
  Math.ceil(state.recordings.allItems.length / state.recordings.pageSize);

export const selectPaginatedItems = (state: RootState) => {
  const { allItems, currentPage, pageSize } = state.recordings;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, allItems.length);
  return allItems.slice(startIdx, endIdx);
};

export const selectStartIdx = (state: RootState) =>
  (state.recordings.currentPage - 1) * state.recordings.pageSize;

export const selectEndIdx = (state: RootState) => {
  const { currentPage, pageSize, allItems } = state.recordings;
  const startIdx = (currentPage - 1) * pageSize;
  return Math.min(startIdx + pageSize, allItems.length);
};

export const selectActiveItem = (state: RootState) =>
  state.recordings.allItems.find((x) => x.id === state.recordings.activeId) ??
  null;
