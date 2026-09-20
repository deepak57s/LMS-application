"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAppSelector } from "@/store";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Badge & Rating Accent */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
              Technical Skills Assessment Platform
            </div>

            {/* Gold/Yellow Rating Accent */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <span className="text-amber-500 font-black">★★★★★</span>
              <span>4.9/5 Student Rating</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Master Skills with <span className="text-violet-600">Instant Exam Feedback</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Take curated technical assessments across Web Development, Data Science, and Machine Learning. 
            All scores are calculated securely on the server with zero client-side answer leaks.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 min-h-[48px]">
            {mounted && isAuthenticated ? (
              <Link
                href={user?.onboarding_completed ? "/dashboard" : "/onboarding"}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition shadow-sm"
              >
                Go to Your Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition shadow-sm"
                >
                  Get Started Free →
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-white transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm mb-3">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Curated Domains
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore specialized questions in Frontend, Backend, Data Science, and AI.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm mb-3">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Interactive Test Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Redux Toolkit for single-question navigation and instant question jumping.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm mb-3">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Secure Server Grading
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answers are scored against database keys without exposing answers to the browser.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}