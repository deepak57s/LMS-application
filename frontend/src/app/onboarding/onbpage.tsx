"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import {
  useGetCatalogQuery,
  useCompleteOnboardingMutation,
} from "@/store/apiSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser } from "@/store/slices/authSlice";

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { data: domains, isLoading, isError } = useGetCatalogQuery();
  const [completeOnboarding, { isLoading: isSubmitting }] =
    useCompleteOnboardingMutation();

  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedDomain = domains?.find((d) => d.id === selectedDomainId);

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomainId(domainId);
    setSelectedTopicId("");
  };

  const handleSubmit = async () => {
    if (!selectedDomainId || !selectedTopicId) {
      setErrorMessage("Please select both a domain and a topic to proceed.");
      return;
    }

    setErrorMessage("");
    try {
      await completeOnboarding({
        domain_id: selectedDomainId,
        topic_id: selectedTopicId,
      }).unwrap();

      if (user) {
        dispatch(updateUser({ ...user, onboarding_completed: true }));
      }
      router.replace("/dashboard");
    } catch (err: any) {
      const detail = err?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to save preferences. Please try again."
      );
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 bg-[#f8fafc]">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold tracking-wide uppercase mb-3 border border-violet-100">
            Step 1 of 1 • Personalize Your Track
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Learning Path
          </h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Select the technical domain and topic you would like to focus on. You can always change this later or test other topics from your dashboard.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <span className="font-bold text-base">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Loading available courses & domains...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600">
            Failed to load catalog. Please ensure the backend server is running.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Step 1: Select Domain */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Select a Domain
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains?.map((domain) => {
                  const isSelected = selectedDomainId === domain.id;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => handleDomainSelect(domain.id)}
                      className={`text-left p-5 rounded-xl border-2 transition relative flex flex-col justify-between ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-slate-900 text-base">
                            {domain.name}
                          </h3>
                          {isSelected && (
                            <span className="text-violet-600 font-bold text-sm">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {domain.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-400">
                        {domain.topics.length} topics available
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Select Topic */}
            {selectedDomain && (
              <section className="animate-fadeIn">
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Select a Topic in {selectedDomain.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDomain.topics.map((topic) => {
                    const isSelected = selectedTopicId === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`text-left p-4 rounded-xl border-2 transition ${
                          isSelected
                            ? "border-violet-600 bg-violet-50/60 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {topic.name}
                          </h4>
                          {isSelected && (
                            <span className="text-violet-600 font-bold text-xs">
                              ✓ Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {topic.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Submit Bar */}
            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                disabled={!selectedDomainId || !selectedTopicId || isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Track...
                  </>
                ) : (
                  "Complete & Go to Dashboard →"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}