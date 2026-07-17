"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ShieldAlert, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
          <MailCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          If an account exists for <strong>{email}</strong>, a password reset
          link has been sent.
        </p>
        <Link
          href="/login"
          className="inline-block text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            className="text-xs text-slate-455 font-bold uppercase tracking-wider block"
            htmlFor="forgot-email"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Send Reset Link</span>
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
