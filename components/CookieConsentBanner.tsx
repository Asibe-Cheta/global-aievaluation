"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

const CONSENT_COOKIE = "gr_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setConsentCookie(value: "accepted" | "rejected") {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax`;

  // If the visitor arrived on a referral link this same session, accepting
  // now should still credit that referral — middleware only sets gr_ref on
  // a fresh request, and clicking a button here doesn't trigger one, so we
  // mirror that same write client-side instead of losing the attribution.
  if (value === "accepted") {
    const refCode = new URLSearchParams(window.location.search).get("ref");
    if (refCode) {
      document.cookie = `gr_ref=${refCode.slice(0, 32)}; path=/; max-age=${60 * 60 * 24 * 60}; samesite=lax`;
    }
  }
}

function getConsentCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )gr_consent=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function CookieConsentBanner({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Shows automatically on first visit (no decision recorded yet), and can
  // also be reopened any time via the footer's "Cookie Settings" link.
  const [autoVisible, setAutoVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [referralOptIn, setReferralOptIn] = useState(true);

  useEffect(() => {
    if (getConsentCookie() === null) setAutoVisible(true);
  }, []);

  const visible = open || autoVisible;

  const close = () => {
    setAutoVisible(false);
    setManaging(false);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    setConsentCookie("accepted");
    close();
  };

  const handleRejectNonEssential = () => {
    setConsentCookie("rejected");
    close();
  };

  const handleSavePreferences = () => {
    setConsentCookie(referralOptIn ? "accepted" : "rejected");
    close();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 flex justify-center animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Cookie preferences</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We use essential cookies to keep you signed in. With your consent, we also use a referral-attribution
              cookie to credit affiliates for referred purchases. We don&apos;t use analytics or advertising
              cookies. See our{" "}
              <a href="/cookies" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Cookie Policy
              </a>{" "}
              for details.
            </p>
          </div>
          <button
            onClick={close}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {managing && (
          <div className="pl-11 space-y-2">
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Referral attribution</p>
                <p className="text-[11px] text-slate-450">Credits an affiliate if you arrived via their link.</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={referralOptIn}
                  onChange={(e) => setReferralOptIn(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-450">
              <div className="w-9 h-5 shrink-0 opacity-40 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <span>Essential (login, security) &mdash; always on, not optional</span>
            </div>
          </div>
        )}

        <div className="pl-11 flex flex-wrap items-center gap-2.5">
          {managing ? (
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setManaging(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Manage Preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
