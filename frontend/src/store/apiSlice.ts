import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  User,
  Domain,
  StartExamResponse,
  ExamResultResponse,
} from "@/types";
import type { RootState } from "./index";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token || 
        (typeof window !== "undefined" ? localStorage.getItem("lms_token") : null);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Catalog", "Exam"],
  endpoints: (builder) => ({
    // Auth endpoints
    signup: builder.mutation<
      { token: string; user: User },
      { name: string; email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<
      { token: string; user: User },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // Catalog & Onboarding
    getCatalog: builder.query<Domain[], void>({
      query: () => "/catalog",
      providesTags: ["Catalog"],
    }),

    completeOnboarding: builder.mutation<
      { message: string },
      { domain_id: string; topic_id: string }
    >({
      query: (body) => ({
        url: "/onboarding",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Exam Flow
    startExam: builder.mutation<StartExamResponse, { topic_id: string }>({
      query: (body) => ({
        url: "/exams/start",
        method: "POST",
        body,
      }),
    }),

    submitExam: builder.mutation<
      ExamResultResponse,
      { sessionId: string; answers: Record<string, number> }
    >({
      query: ({ sessionId, answers }) => ({
        url: `/exams/${sessionId}/submit`,
        method: "POST",
        body: { answers },
      }),
    }),

    getExamResult: builder.query<ExamResultResponse, string>({
      query: (sessionId) => `/exams/${sessionId}/result`,
      providesTags: ["Exam"],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGetMeQuery,
  useGetCatalogQuery,
  useCompleteOnboardingMutation,
  useStartExamMutation,
  useSubmitExamMutation,
  useGetExamResultQuery,
} = apiSlice;
