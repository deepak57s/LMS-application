"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-violet-600 tracking-tight">
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
                className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
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
  );
}
