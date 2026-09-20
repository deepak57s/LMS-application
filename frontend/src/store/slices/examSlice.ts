import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Question, ExamResultResponse } from "@/types";

interface ExamState {
  sessionId: string | null;
  topicName: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  result: ExamResultResponse | null;
}

const STORAGE_KEY = "lms_active_exam_session";

const syncToStorage = (state: ExamState) => {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
  }
};

const clearStorage = () => {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
};

const initialState: ExamState = {
  sessionId: null,
  topicName: "",
  questions: [],
  currentIndex: 0,
  answers: {},
  result: null,
};

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    startExamSession: (
      state,
      action: PayloadAction<{
        sessionId: string;
        topicName: string;
        questions: Question[];
      }>
    ) => {
      state.sessionId = action.payload.sessionId;
      state.topicName = action.payload.topicName;
      state.questions = action.payload.questions;
      state.currentIndex = 0;
      state.answers = {};
      state.result = null;
      syncToStorage(state);
    },
    hydrateExamSession: (state) => {
      if (typeof window !== "undefined") {
        try {
          const saved = sessionStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.sessionId) {
              state.sessionId = parsed.sessionId;
              state.topicName = parsed.topicName || "";
              state.questions = parsed.questions || [];
              state.currentIndex = parsed.currentIndex || 0;
              state.answers = parsed.answers || {};
              state.result = parsed.result || null;
            }
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    },
    selectAnswer: (
      state,
      action: PayloadAction<{ questionId: string; optionIndex: number }>
    ) => {
      state.answers[action.payload.questionId] = action.payload.optionIndex;
      syncToStorage(state);
    },
    goToQuestion: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.questions.length) {
        state.currentIndex = action.payload;
        syncToStorage(state);
      }
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        syncToStorage(state);
      }
    },
    prevQuestion: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        syncToStorage(state);
      }
    },
    setResult: (state, action: PayloadAction<ExamResultResponse>) => {
      state.result = action.payload;
      clearStorage();
    },
    resetExam: (state) => {
      state.sessionId = null;
      state.topicName = "";
      state.questions = [];
      state.currentIndex = 0;
      state.answers = {};
      state.result = null;
      clearStorage();
    },
  },
});

export const {
  startExamSession,
  hydrateExamSession,
  selectAnswer,
  goToQuestion,
  nextQuestion,
  prevQuestion,
  setResult,
  resetExam,
} = examSlice.actions;

export default examSlice.reducer;
