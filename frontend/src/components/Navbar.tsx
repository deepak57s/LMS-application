"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { resetExam } from "@/store/slices/examSlice";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<"dashboard" | "logout" | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sessionId } = useAppSelector((state) => state.exam);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasActiveExam = !!sessionId;

  const handleLogoClick = (e: React.MouseEvent) => {
    if (hasActiveExam) {
      e.preventDefault();
      setLeaveTarget("dashboard");
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (hasActiveExam) {
      e.preventDefault();
      setLeaveTarget("dashboard");
    }
  };

  const handleLogoutClick = () => {
    if (hasActiveExam) {
      setLeaveTarget("logout");
    } else {
      dispatch(logout());
      router.replace("/login");
    }
  };

  const handleConfirmLeave = () => {
    dispatch(resetExam());
    if (leaveTarget === "logout") {
      dispatch(logout());
      router.replace("/login");
    } else {
      router.push("/dashboard");
    }
    setLeaveTarget(null);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 font-bold text-lg text-violet-600 tracking-tight"
          >
            <span className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm font-black">
              LMS
            </span>
            <span className="text-slate-900 font-extrabold">ExamPlatform</span>
          </Link>


          <nav className="flex items-center gap-4 text-sm font-medium min-h-[36px]">
            {!mounted ? (
              <div className="h-8 w-28" />
            ) : isAuthenticated && user ? (
              <>
                <span className="text-slate-600 hidden sm:inline">
                  Signed in as <strong className="text-slate-900">{user.name}</strong>
                </span>
                <Link
                  href="/dashboard"
                  onClick={handleDashboardClick}
                  className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-slate-700 hover:text-violet-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 rounded-md bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Leave Exam Confirmation Modal */}
      {leaveTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Leave Active Exam?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              You have an exam in progress. If you{" "}
              {leaveTarget === "logout" ? "log out" : "go to the dashboard"}
              , your current session will be <strong className="text-slate-900">lost</strong> and
              your answers will <strong className="text-slate-900">not</strong> be submitted.
            </p>
            <span className="block p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs mb-6">
              ★ Warning: Your exam progress will not be saved!
            </span>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLeaveTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
              >
                {leaveTarget === "logout" ? "Logout Anyway" : "Leave Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
