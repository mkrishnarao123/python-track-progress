import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getChecklistDays,
  getInterviewQAData,
  getPracticeTopicsData,
  getQuizBankData,
  getSidebarMenuList,
} from '../services/python_learn_api';

function createResourceState(defaultData) {
  return {
    data: defaultData,
    status: 'idle',
    error: null,
  };
}

function getInitialState() {
  return {
    checklistDays: createResourceState([]),
    sidebarMenu: createResourceState({
      brand: 'Learning Hub',
      footer: 'Track your progress daily',
      menuItems: [],
    }),
    interviewQA: createResourceState({
      topicMap: {},
      starterCommands: [],
    }),
    practiceTopics: createResourceState({}),
    quizBank: createResourceState({ topics: [] }),
  };
}

function createResourceThunk(typePrefix, fetcher, stateKey) {
  return createAsyncThunk(
    typePrefix,
    async () => fetcher(),
    {
      condition: (_, { getState }) => {
        const status = getState().pythonLearn[stateKey].status;
        return status !== 'loading' && status !== 'succeeded';
      },
    }
  );
}

export const fetchChecklistDays = createResourceThunk(
  'pythonLearn/fetchChecklistDays',
  getChecklistDays,
  'checklistDays'
);

export const fetchSidebarMenuData = createResourceThunk(
  'pythonLearn/fetchSidebarMenuData',
  getSidebarMenuList,
  'sidebarMenu'
);

export const fetchInterviewQAData = createResourceThunk(
  'pythonLearn/fetchInterviewQAData',
  getInterviewQAData,
  'interviewQA'
);

export const fetchPracticeTopicsData = createResourceThunk(
  'pythonLearn/fetchPracticeTopicsData',
  getPracticeTopicsData,
  'practiceTopics'
);

export const fetchQuizBankData = createResourceThunk(
  'pythonLearn/fetchQuizBankData',
  getQuizBankData,
  'quizBank'
);

function addResourceCases(builder, thunk, stateKey) {
  builder
    .addCase(thunk.pending, (state) => {
      state[stateKey].status = 'loading';
      state[stateKey].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[stateKey].status = 'succeeded';
      state[stateKey].data = action.payload;
      state[stateKey].error = null;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[stateKey].status = 'rejected';
      state[stateKey].error = action.error.message || 'Failed to load data';
    });
}

const pythonLearnSlice = createSlice({
  name: 'pythonLearn',
  initialState: getInitialState(),
  reducers: {
    resetPythonLearnState() {
      return getInitialState();
    },
  },
  extraReducers: (builder) => {
    addResourceCases(builder, fetchChecklistDays, 'checklistDays');
    addResourceCases(builder, fetchSidebarMenuData, 'sidebarMenu');
    addResourceCases(builder, fetchInterviewQAData, 'interviewQA');
    addResourceCases(builder, fetchPracticeTopicsData, 'practiceTopics');
    addResourceCases(builder, fetchQuizBankData, 'quizBank');
  },
});

export const { resetPythonLearnState } = pythonLearnSlice.actions;

export const selectChecklistDays = (state) => state.pythonLearn.checklistDays.data;
export const selectSidebarMenuData = (state) => state.pythonLearn.sidebarMenu.data;
export const selectInterviewQAData = (state) => state.pythonLearn.interviewQA.data;
export const selectPracticeTopicsData = (state) => state.pythonLearn.practiceTopics.data;
export const selectQuizBankData = (state) => state.pythonLearn.quizBank.data;

export default pythonLearnSlice.reducer;