"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import JobsView from "./JobsView";
import { Rank, type UserStats } from "../types";
import type { JobOpportunity } from "../data/jobs";

interface PublicJobsViewProps {
  jobs: JobOpportunity[];
}

// A visitor browsing the public job board hasn't done any lessons/practice
// yet, so every readiness score legitimately floors out — this isn't a
// placeholder, it's the correct stats shape for "no account".
const ANONYMOUS_STATS: UserStats = {
  completedLessons: [],
  completedSimulations: [],
  passedExams: [],
  streakCount: 0,
  lastActiveDate: "",
  xp: 0,
  activeRank: Rank.TRAINEE,
  skills: {
    promptEvaluation: 0,
    responseRanking: 0,
    factChecking: 0,
    safetyReview: 0,
    annotation: 0,
    reasoning: 0,
    reasoningEvaluation: 0,
    instructionFollowing: 0,
  },
  practiceSubmissions: {},
};

export default function PublicJobsView({ jobs }: PublicJobsViewProps) {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-6 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 dark:from-indigo-500/5 dark:to-emerald-500/5 border border-indigo-500/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
          This board is free and open to everyone — no signup required. Create a free account to track your skill
          readiness, unlock practice simulations, and prep with our AI interviewer before you apply.
        </p>
        <button
          onClick={() => router.push("/signup")}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create Free Account
        </button>
      </div>

      <JobsView stats={ANONYMOUS_STATS} jobs={jobs} onBack={() => router.push("/")} backLabel="Back to Home" />
    </div>
  );
}
