import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loadingSlice';
import pythonLearnReducer from './pythonLearnSlice';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    pythonLearn: pythonLearnReducer,
  },
});