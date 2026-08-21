"use client";

import { PartyPopper, Check, Loader2, AlertTriangle, ArrowRight, BookOpen, Briefcase, MessageSquare } from "lucide-react";
import { TIERS, type TierId } from "../lib/pricing";

export type WelcomeSyncStatus = "syncing" | "ready" | "error";

interface WelcomeViewProps {
  status: WelcomeSyncStatus;
  tier: TierId;
  onRetry: () => void;
  onContinue: () => void;
  onGoToPractice: () => void;
  onGoToInterview: () => void;
}

export default function WelcomeView({ status, tier, onRetry, onContinue, onGoToPractice, onGoToInterview }: WelcomeViewProps) {
  if (status === "syncing") {
    return (
      <div className="max-w-lg mx-auto pl-1 py-16 text-center space-y-4 animate-fade-in">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">Confirming your payment&hellip;</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">This usually takes just a few seconds.</p>
      </div>
    );
  }

  if (status === "error" || tier === "free") {
    return (
      <div className="max-w-lg mx-auto pl-1 py-16 text-center space-y-5 animate-fade-in">
        <div className="inline-flex p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-full text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Still confirming your payment</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Stripe processed your payment, but it's taking a little longer than usual to reflect on your account.
            This is safe to retry — it won't charge you again.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          Check Again
        </button>
      </div>
    );
  }

  const meta = TIERS[tier];

  return (
    <div className="max-w-2xl mx-auto pl-1 py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-emerald-600 dark:text-emerald-400">
          <PartyPopper className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Welcome to {meta.displayName}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your payment went through and your account is now on the <span className="font-bold text-slate-700 dark:text-slate-300">{meta.label}</span> plan.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450">What's unlocked</span>
        <ul className="space-y-2.5">
          {meta.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onContinue}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 text-left transition-colors cursor-pointer flex flex-col gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-xs font-bold">Start Learning</span>
        </button>
        <button
          onClick={onGoToPractice}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 text-left transition-colors cursor-pointer flex flex-col gap-2"
        >
          <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">Real World Practice</span>
        </button>
        <button
          onClick={onGoToInterview}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 text-left transition-colors cursor-pointer flex flex-col gap-2"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">AI Interview Simulator</span>
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={onContinue}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
        >
          Go to AI Career Hub <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
