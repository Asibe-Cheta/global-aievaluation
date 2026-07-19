import React, { useState } from "react";
import {
  Check, Lock, Sparkles, Shield, Users, Briefcase, Award,
  Zap, BookOpen, ChevronRight, HelpCircle, AlertCircle, ArrowLeft,
  MessageSquare, Star, Gift, CheckCircle2, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { UserStats } from "../types";
import { createCheckoutSession, createPortalSession } from "../lib/actions/billing";

interface MembershipViewProps {
  stats: UserStats;
  checkoutResult?: "success" | "cancelled" | null;
  onDismissCheckoutResult?: () => void;
  onBack?: () => void;
  onNavigateToTab?: (tabId: string) => void;
}

function isRedirectError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
}

export default function MembershipView({ stats, checkoutResult, onDismissCheckoutResult, onBack, onNavigateToTab }: MembershipViewProps) {
  const currentTier = stats.membershipTier || "starter";
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const successMessage =
    checkoutResult === "success"
      ? "🎉 Payment successful! Your plan updates as soon as Stripe confirms the subscription — refresh in a few seconds if it isn't reflected yet."
      : null;

  const handleSelectTier = async (tier: "starter" | "professional" | "career_accelerator") => {
    setErrorMessage(null);
    setPendingTier(tier);
    try {
      if (tier === "starter" || currentTier !== "starter") {
        // Cancelling, or switching between two paid tiers, both go through
        // the Stripe portal so it updates the existing subscription instead
        // of starting a second, parallel one via Checkout.
        await createPortalSession();
      } else {
        await createCheckoutSession(tier, billingPeriod);
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setPendingTier(null);
    }
  };

  const handleManageBilling = async () => {
    setErrorMessage(null);
    setPendingTier("manage");
    try {
      await createPortalSession();
    } catch (err) {
      if (isRedirectError(err)) throw err;
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong opening billing management.",
      );
      setPendingTier(null);
    }
  };

  const starterFeatures = [
    "Full access to the AI Evaluation Academy",
    "All lessons and future lesson updates",
    "Unlimited practice exercises",
    "Unlimited evaluation projects",
    "Qualification exams",
    "Professional Annotation & Labeling training",
    "Progress tracking",
    "Certificates of completion",
    "CV writing lessons and templates",
    "LinkedIn optimization lessons",
    "AI Resume Checker",
    "AI-powered CV feedback",
    "Job Board (included for all tiers)"
  ];

  const professionalFeatures = [
    "AI Interview Simulator (Unlimited practice)",
    "Voice AI interviews",
    "Platform-specific simulations (Scale AI, Outlier, Mercor, Micro1, Alignerr, Invisible, General)",
    "CV-based personalized interviews",
    "Scenario-based interview questions",
    "Live AI evaluation tasks",
    "Annotation interview tasks",
    "Adaptive questioning",
    "Interviewer Challenge Mode",
    "AI Interview Report",
    "Interview Readiness Score",
    "Unlimited interview attempts"
  ];

  const acceleratorFeatures = [
    "Private community access",
    "Weekly live mastermind sessions",
    "Weekly Q&A with John and invited experts",
    "Peer networking and accountability groups",
    "Platform updates and hiring news",
    "Personalized CV review with written feedback",
    "Personalized LinkedIn profile review",
    "AI interview performance review",
    "Evaluation rationale review & feedback",
    "Application strategy guidance",
    "Monthly Mock Hiring Days",
    "Office Hours with experts",
    "Priority support"
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in pb-24">
      
      {/* Back Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center gap-3">
          {currentTier !== "starter" && (
            <button
              onClick={handleManageBilling}
              disabled={pendingTier !== null}
              className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {pendingTier === "manage" ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
              )}
              Manage Billing
            </button>
          )}
        </div>
      </div>

      {/* Success / Cancelled Notification Banner */}
      {successMessage && (
        <div className="mb-8 p-4 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-start gap-3 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold my-0 leading-tight">Payment Successful</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-relaxed">{successMessage}</p>
          </div>
          <button
            onClick={onDismissCheckoutResult}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer shrink-0"
          >
            ×
          </button>
        </div>
      )}
      {checkoutResult === "cancelled" && (
        <div className="mb-8 p-4 bg-slate-500/10 border-2 border-slate-500/20 text-slate-700 dark:text-slate-300 rounded-2xl flex items-start gap-3 shadow-md animate-fade-in">
          <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold my-0 leading-tight">Checkout Cancelled</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-relaxed">No charge was made. You can try again anytime.</p>
          </div>
          <button
            onClick={onDismissCheckoutResult}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer shrink-0"
          >
            ×
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-8 p-4 bg-rose-500/10 border-2 border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl flex items-start gap-3 shadow-md animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold my-0 leading-tight">Something Went Wrong</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-mono">
          Empower Your AI Career
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Flexible Membership Tiers
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Upgrade your plan to unlock high-fidelity AI tools, realistic platform interview simulators, custom expert feedback, and job coaching.
        </p>

        {/* Pricing Period Selector */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200/50 dark:border-slate-850 mt-4">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              billingPeriod === "monthly"
                ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("annually")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingPeriod === "annually"
                ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>Annually</span>
            <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
        
        {/* Starter Plan Card */}
        <div className={`bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between transition-all relative border-2 ${
          currentTier === "starter"
            ? "border-slate-400 dark:border-slate-750 bg-slate-50/10"
            : "border-slate-100 dark:border-slate-850"
        } hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md`}>
          {currentTier === "starter" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-500 text-white text-[10px] uppercase font-mono font-extrabold px-3 py-1 rounded-full tracking-wider shadow-sm">
              Your Current Plan
            </span>
          )}

          <div className="space-y-6">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-widest font-mono">
                Starter
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Independent Learner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Designed for users who want to learn independently and prepare for AI evaluation jobs at their own pace.
              </p>
            </div>

            <div className="py-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {billingPeriod === "monthly" ? "€9.99" : "€8.25"}
              </span>
              <span className="text-slate-400 text-xs font-medium"> / month</span>
              {billingPeriod === "annually" && (
                <div className="text-[10px] font-mono text-green-500 mt-1 font-bold">Billed annually (€99/year)</div>
              )}
            </div>

            <button
              onClick={() => handleSelectTier("starter")}
              disabled={currentTier === "starter" || pendingTier !== null}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-default flex items-center justify-center gap-2 ${
                currentTier === "starter"
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-550 border border-slate-200/50 dark:border-slate-800 cursor-default"
                  : "bg-slate-950 hover:bg-slate-850 text-white dark:bg-slate-800 dark:hover:bg-slate-750 disabled:opacity-60"
              }`}
            >
              {pendingTier === "starter" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {currentTier === "starter" ? "Active Plan" : "Downgrade to Starter"}
            </button>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                What's Included:
              </h4>
              <ul className="space-y-3">
                {starterFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Plan Card */}
        <div className={`bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between transition-all relative border-2 ${
          currentTier === "professional"
            ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-600/10 dark:ring-indigo-500/10"
            : "border-slate-100 dark:border-slate-850"
        } hover:border-indigo-400 dark:hover:border-indigo-700 shadow-sm hover:shadow-lg`}>
          
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white text-[9px] uppercase font-mono font-black px-3.5 py-1 rounded-full tracking-widest shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Popular
          </div>

          {currentTier === "professional" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-mono font-extrabold px-3 py-1 rounded-full tracking-wider shadow-sm">
              Your Current Plan
            </span>
          )}

          <div className="space-y-6">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-widest font-mono">
                Professional
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Job Ready Simulator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Includes **everything in Starter**, plus realistic platform-specific interview simulations with real-time feedback.
              </p>
            </div>

            <div className="py-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {billingPeriod === "monthly" ? "€19.99" : "€16.58"}
              </span>
              <span className="text-slate-400 text-xs font-medium"> / month</span>
              {billingPeriod === "annually" && (
                <div className="text-[10px] font-mono text-green-500 mt-1 font-bold">Billed annually (€199/year)</div>
              )}
            </div>

            <button
              onClick={() => handleSelectTier("professional")}
              disabled={currentTier === "professional" || pendingTier !== null}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer disabled:cursor-default flex items-center justify-center gap-2 ${
                currentTier === "professional"
                  ? "bg-indigo-50 text-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-550 border border-indigo-100 dark:border-indigo-900 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-md disabled:opacity-60"
              }`}
            >
              {pendingTier === "professional" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {currentTier === "professional" ? "Active Plan" : currentTier === "starter" ? "Upgrade to Professional" : "Downgrade to Professional"}
            </button>

            {/* Starter to Pro upgrade promo box */}
            {currentTier === "starter" && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4.5 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1 font-mono">
                  <Zap className="w-3.5 h-3.5" /> Upgrade Value:
                </span>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans">
                  Unlock the **AI Interview Simulator** and practice realistic, platform-specific interviews like **Outlier**, **Scale AI**, and **Alignerr**.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Everything in Starter, Plus:
                </h4>
              </div>
              <ul className="space-y-3">
                {professionalFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                    <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Career Accelerator Plan Card */}
        <div className={`bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between transition-all relative border-2 ${
          currentTier === "career_accelerator"
            ? "border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/10"
            : "border-slate-100 dark:border-slate-850"
        } hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-lg`}>
          
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-white text-[9px] uppercase font-mono font-black px-3.5 py-1 rounded-full tracking-widest shadow-sm flex items-center gap-1">
            <Award className="w-3 h-3" /> Elite Support
          </div>

          {currentTier === "career_accelerator" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] uppercase font-mono font-extrabold px-3 py-1 rounded-full tracking-wider shadow-sm">
              Your Current Plan
            </span>
          )}

          <div className="space-y-6">
            <div>
              <span className="text-amber-600 dark:text-amber-500 text-xs font-extrabold uppercase tracking-widest font-mono">
                Career Accelerator
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Personalized Coaching
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Includes **everything in Professional**, plus expert 1-on-1 human coaching, resume reviews, and premium community.
              </p>
            </div>

            <div className="py-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {billingPeriod === "monthly" ? "€39.99" : "€33.25"}
              </span>
              <span className="text-slate-400 text-xs font-medium"> / month</span>
              {billingPeriod === "annually" && (
                <div className="text-[10px] font-mono text-amber-500 mt-1 font-bold">Billed annually (€399/year)</div>
              )}
            </div>

            <button
              onClick={() => handleSelectTier("career_accelerator")}
              disabled={currentTier === "career_accelerator" || pendingTier !== null}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer disabled:cursor-default flex items-center justify-center gap-2 ${
                currentTier === "career_accelerator"
                  ? "bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900 cursor-default"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:shadow-md disabled:opacity-60"
              }`}
            >
              {pendingTier === "career_accelerator" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {currentTier === "career_accelerator" ? "Active Plan" : "Upgrade to Career Accelerator"}
            </button>

            {/* Pro to Accelerator upgrade promo box */}
            {currentTier !== "career_accelerator" && (
              <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4.5 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide flex items-center gap-1 font-mono">
                  <Star className="w-3.5 h-3.5" /> Acceleration Bonus:
                </span>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans">
                  Get expert feedback, coaching, private community support, and personalized career guidance to maximize your chances of getting hired.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Everything in Professional, Plus:
              </h4>
              <ul className="space-y-3">
                {acceleratorFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-250 leading-relaxed">
                    <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Visually Locked Features Notice section */}
      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-slate-850">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" />
          Feature Lock & Upgrade Policy
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Premium features are locked dynamically based on your subscription tier. You can upgrade or downgrade instantly at any time to unlock corresponding features or save on subscription cost. Downwards changes preserve your progress, lessons history, and readiness scores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase font-mono tracking-wider block">
              Tier 2 Premium Access
            </span>
            <h4 className="text-sm font-bold text-slate-850 dark:text-white my-0">
              AI Interview Simulator
            </h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed my-0">
              Interactive voice & text scenarios testing your ability to answer prompt engineering questions, write calibrations, and survive interview challenge modes. Requires Professional or Accelerator membership.
            </p>
            {currentTier === "starter" ? (
              <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-[10px] font-bold px-2.5 py-0.5 rounded mt-2 uppercase">
                <Lock className="w-3 h-3" /> Currently Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded mt-2 uppercase">
                <Check className="w-3 h-3" /> Fully Unlocked
              </span>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
            <span className="text-amber-600 dark:text-amber-500 text-xs font-bold uppercase font-mono tracking-wider block">
              Tier 3 Premium Access
            </span>
            <h4 className="text-sm font-bold text-slate-850 dark:text-white my-0">
              Private Accelerator Hub
            </h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed my-0">
              Private community server, live weekly mastermind calls with top AI evaluation team leaders, expert-led office hours, and 1-on-1 human resume reviews. Requires Career Accelerator membership.
            </p>
            {currentTier !== "career_accelerator" ? (
              <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-[10px] font-bold px-2.5 py-0.5 rounded mt-2 uppercase">
                <Lock className="w-3 h-3" /> Currently Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded mt-2 uppercase">
                <Check className="w-3 h-3" /> Fully Unlocked
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
