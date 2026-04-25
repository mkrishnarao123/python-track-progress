import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pendingRequests: 0,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    requestStarted(state) {
      state.pendingRequests += 1;
    },
    requestFinished(state) {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
    },
    resetLoadingState() {
      return initialState;
    },
  },
});

export const { requestStarted, requestFinished, resetLoadingState } = loadingSlice.actions;

export const selectIsGlobalLoading = (state) => state.loading.pendingRequests > 0;

export default loadingSlice.reducer;