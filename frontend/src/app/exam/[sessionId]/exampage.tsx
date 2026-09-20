"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectAnswer,
  nextQuestion,
  prevQuestion,
  goToQuestion,
  setResult,
  resetExam,
  hydrateExamSession,
} from "@/store/slices/examSlice";
import { useSubmitExamMutation } from "@/store/apiSlice";

export default function ExamSessionPage() {
  const router = useRouter();
  const params = useParams();
  const routeSessionId = params?.sessionId as string;

  const dispatch = useAppDispatch();
  const { sessionId, topicName, questions, currentIndex, answers } =
    useAppSelector((state) => state.exam);

  const [submitExam, { isLoading: isSubmitting }] = useSubmitExamMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isSubmittingRef = useRef(false);

  // Hydrate session from sessionStorage on mount (supports page refresh)
  useEffect(() => {
    dispatch(hydrateExamSession());
  }, [dispatch]);

  // If exam is completed or not active for this route, immediately redirect to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeSession = sessionStorage.getItem("lms_active_exam_session");
      if (!activeSession && (!sessionId || sessionId !== routeSessionId)) {
        router.replace("/dashboard");
      }
    }
  }, [sessionId, routeSessionId, router]);


  // Trap browser top back button and tab close
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Push barrier entry into history so back arrow cannot exit silently
    window.history.pushState({ examBarrier: true }, "", window.location.href);

    const handlePopState = () => {
      if (isSubmittingRef.current) return;
      // Re-push barrier state immediately to keep URL locked on the exam
      window.history.pushState({ examBarrier: true }, "", window.location.href);
      // Show explicit warning modal
      setShowExitModal(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmittingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId, routeSessionId]);

  if (!sessionId || sessionId !== routeSessionId || questions.length === 0) {
    return (
      <AuthGuard requireAuth={true}>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto w-full p-8 flex flex-col items-center justify-center text-center bg-[#f8fafc]">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold mb-4">
            !
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            No Active Session Found
          </h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            This exam session is either already completed or was interrupted. Please select a topic from your dashboard to begin a new test.
          </p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition shadow-sm"
          >
            Back to Dashboard
          </Link>
        </main>
      </AuthGuard>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const currentSelectedOption = answers[currentQuestion.id];

  const handleSelectOption = (optionIndex: number) => {
    dispatch(
      selectAnswer({
        questionId: currentQuestion.id,
        optionIndex,
      })
    );
  };

  const handleFinalSubmit = async () => {
    setErrorMessage("");
    try {
      isSubmittingRef.current = true;
      const response = await submitExam({
        sessionId,
        answers,
      }).unwrap();

      dispatch(setResult(response));
      router.replace(`/result/${sessionId}`);
    } catch (err: any) {
      isSubmittingRef.current = false;
      setShowConfirmModal(false);
      const detail = err?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to submit exam. Please try again."
      );
    }
  };

  const handleConfirmExit = () => {
    isSubmittingRef.current = true;
    dispatch(resetExam());
    router.replace("/dashboard");
  };

  return (
    <AuthGuard requireAuth={true}>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col bg-[#f8fafc]">
        {/* Exam Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Exam Session
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {topicName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Progress</div>
              <div className="text-sm font-bold text-slate-900">
                {answeredCount} of {totalQuestions} answered
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Question Navigator Pills */}
        <div className="py-4 flex items-center gap-2 overflow-x-auto">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q.id] !== undefined;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => dispatch(goToQuestion(idx))}
                className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition ${
                  isCurrent
                    ? "bg-violet-600 text-white ring-2 ring-violet-600 ring-offset-2"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="my-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span className="font-bold text-base">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Question Card */}
        <div className="my-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              {currentSelectedOption !== undefined && (
                <span className="text-emerald-600 font-bold">Answered</span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
              {currentQuestion.question_text}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((optionText, optIndex) => {
                const isSelected = currentSelectedOption === optIndex;
                const letter = String.fromCharCode(65 + optIndex);

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(optIndex)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                      isSelected
                        ? "border-violet-600 bg-violet-50/70 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm text-slate-800 font-medium">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => dispatch(prevQuestion())}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => dispatch(nextQuestion())}
                className="px-5 py-2 rounded-lg bg-violet-600 text-white font-medium text-xs hover:bg-violet-700 transition shadow-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm"
              >
                Review & Submit
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-scaleUp">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Submit Your Assessment?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                You have answered <strong className="text-slate-900">{answeredCount}</strong> out of{" "}
                <strong className="text-slate-900">{totalQuestions}</strong> questions.
                {unansweredCount > 0 && (
                  <span className="block mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs">
                    ★ Warning: You still have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}!
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Grading Answers...
                    </>
                  ) : (
                    "Confirm & Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button / Navigation Exit Confirmation Modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scaleUp">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold mb-3">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Leave Active Assessment?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                You clicked the browser back button. If you leave now, your assessment session will be <strong className="text-slate-900">abandoned</strong> and your answers will not be submitted.
              </p>
              <span className="block p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs mb-6">
                ★ Warning: Progress is not submitted until you click "Submit Exam".
              </span>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Stay & Continue Test
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
                >
                  Exit to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}