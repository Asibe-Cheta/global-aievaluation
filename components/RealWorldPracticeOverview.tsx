"use client";

import { Layers, Gauge, TrendingUp, MousePointerClick } from "lucide-react";
import { PRACTICE_DOMAINS } from "@/lib/practice-domains";

const HOW_IT_WORKS = [
  "Choose a domain from the sidebar",
  "Select your difficulty level",
  "Complete realistic tasks and receive feedback",
];

export default function RealWorldPracticeOverview() {
  return (
    <div className="max-w-3xl mx-auto pl-1 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Practice Real-World Assessment Tasks
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Practice realistic, job-style AI evaluation tasks across different domains — the
          same kind of judgment calls you&apos;ll make as a working AI evaluator.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {PRACTICE_DOMAINS.length} available domains
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Beginner, Intermediate and Expert difficulty levels
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Progress / XP tracking
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">
          How It Works
        </span>
        <ol className="space-y-2">
          {HOW_IT_WORKS.map((step, idx) => (
            <li key={step} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center gap-2.5 justify-center text-center py-6 text-slate-450 dark:text-slate-500">
        <MousePointerClick className="w-4 h-4 shrink-0" />
        <p className="text-xs font-bold">Select a domain from the sidebar to begin.</p>
      </div>
    </div>
  );
}
