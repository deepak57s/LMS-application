"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useGetCatalogQuery, useStartExamMutation } from "@/store/apiSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { startExamSession } from "@/store/slices/examSlice";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { data: domains, isLoading, isError } = useGetCatalogQuery();
  const [startExam, { isLoading: isStartingExam }] = useStartExamMutation();

  const [activeTopicLoadingId, setActiveTopicLoadingId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartExam = async (topicId: string, topicName: string) => {
    setErrorMessage("");
    setActiveTopicLoadingId(topicId);
    try {
      const response = await startExam({ topic_id: topicId }).unwrap();
      dispatch(
        startExamSession({
          sessionId: response.session_id,
          topicName: response.topic_name,
          questions: response.questions,
        })
      );
      router.push(`/exam/${response.session_id}`);
    } catch (err: any) {
      const detail = err?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to start assessment. Please try again."
      );
      setActiveTopicLoadingId(null);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 bg-[#f8fafc]">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-violet-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide uppercase mb-2 border border-violet-500/30">
                Student Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Choose any topic from the catalog below to start an interactive assessment.
                Backend randomly selects questions to test your knowledge.
              </p>
            </div>

            {/* Gold/Yellow Accent Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-300 text-xs font-semibold">
              <span className="text-amber-400 font-bold">★ Student</span>
              <span></span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span className="font-bold text-base">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Loading domain catalog...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600">
            Failed to load courses. Please check your backend connection.
          </div>
        ) : (
          <div className="space-y-10">
            {domains?.map((domain) => (
              <section key={domain.id} className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {domain.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {domain.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {domain.topics.map((topic) => {
                    const isCurrentLoading =
                      isStartingExam && activeTopicLoadingId === topic.id;
                    return (
                      <div
                        key={topic.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition group"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-xs mb-3 group-hover:bg-violet-600 group-hover:text-white transition">
                            EXAM
                          </div>
                          <h3 className="font-bold text-slate-900 text-base mb-1">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">
                            Multiple Choice
                          </span>
                          <button
                            type="button"
                            disabled={isStartingExam}
                            onClick={() => handleStartExam(topic.id, topic.name)}
                            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
                          >
                            {isCurrentLoading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Starting...</span>
                              </>
                            ) : (
                              <span>Start Test →</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}