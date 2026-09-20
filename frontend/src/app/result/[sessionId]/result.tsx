"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useGetExamResultQuery } from "@/store/apiSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetExam } from "@/store/slices/examSlice";

export default function ResultPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const storedResult = useAppSelector((state) => state.exam.result);
  const {
    data: fetchedResult,
    isLoading,
    isError,
  } = useGetExamResultQuery(sessionId, {
    skip: !!storedResult && storedResult.session_id === sessionId,
  });

  const result =
    storedResult && storedResult.session_id === sessionId
      ? storedResult
      : fetchedResult;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Push barrier state so browser back button triggers popstate directly on the result page
    window.history.pushState({ resultBarrier: true }, "", window.location.href);

    const handlePopState = () => {
      dispatch(resetExam());
      router.replace("/dashboard");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [dispatch, router]);


  const handleBackToDashboard = () => {
    dispatch(resetExam());
    router.replace("/dashboard");
  };


  return (
    <AuthGuard requireAuth={true}>
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-8 flex flex-col items-center justify-center bg-[#f8fafc]">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Calculating final scorecard...</p>
          </div>
        ) : isError || !result ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm w-full">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold mb-3">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Result Not Found
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Could not retrieve the result for this exam session.
            </p>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center w-full animate-fadeIn">
            {/* Pass / Needs Improvement Badge with Gold Rating Accent */}
            {result.percentage >= 70 ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
                <span className="text-amber-500 text-sm">★</span>
                <span>Passed Assessment</span>
                <span className="text-amber-500 text-sm">★</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
                <span className="text-amber-500">!</span>
                <span>Needs Improvement</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Assessment Completed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mb-8 max-w-sm mx-auto">
              Your answers have been securely graded against the answer keys on the server.
            </p>

            {/* Score Stats Box */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 grid grid-cols-2 gap-4">
              <div className="border-r border-slate-200 pr-4">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Total Score
                </span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {result.score}
                  <span className="text-base text-slate-400 font-medium">
                    {" "}/ {result.total_questions}
                  </span>
                </span>
              </div>

              <div className="pl-4">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Percentage
                </span>
                <span
                  className={`text-3xl sm:text-4xl font-black ${
                    result.percentage >= 70
                      ? "text-emerald-600"
                      : "text-amber-500"
                  }`}
                >
                  {result.percentage}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition shadow-sm"
              >
                Take Another Assessment
              </button>
              <Link
                href="/dashboard"
                onClick={() => dispatch(resetExam())}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}