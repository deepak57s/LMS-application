"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireOnboarding = false,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isInitialized) return;

    if (requireAuth && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!requireAuth && isAuthenticated) {
      if (user && !user.onboarding_completed) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
      return;
    }

    if (requireAuth && isAuthenticated && user) {
      if (requireOnboarding && user.onboarding_completed) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isInitialized, requireAuth, requireOnboarding, router, user]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          Checking authorization...
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
