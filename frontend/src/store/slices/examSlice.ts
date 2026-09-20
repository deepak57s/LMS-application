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
    },
    selectAnswer: (
      state,
      action: PayloadAction<{ questionId: string; optionIndex: number }>
    ) => {
      state.answers[action.payload.questionId] = action.payload.optionIndex;
    },
    goToQuestion: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.questions.length) {
        state.currentIndex = action.payload;
      }
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
      }
    },
    prevQuestion: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    setResult: (state, action: PayloadAction<ExamResultResponse>) => {
      state.result = action.payload;
    },
    resetExam: (state) => {
      state.sessionId = null;
      state.topicName = "";
      state.questions = [];
      state.currentIndex = 0;
      state.answers = {};
      state.result = null;
    },
  },
});

export const {
  startExamSession,
  selectAnswer,
  goToQuestion,
  nextQuestion,
  prevQuestion,
  setResult,
  resetExam,
} = examSlice.actions;

export default examSlice.reducer;
