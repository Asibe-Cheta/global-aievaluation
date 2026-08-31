"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, Gift, Link2, Share2, TrendingUp, Wallet, Check, Copy,
  ShieldAlert, RefreshCw, CheckCircle2, Megaphone, Sparkles,
} from "lucide-react";
import {
  becomeAffiliate,
  getMyAffiliateStatus,
  getMyReferralSummary,
  type AffiliateStatus,
  type AffiliateReferralSummary,
} from "../lib/actions/affiliates";

const DEFAULT_COMMISSION_LABEL = "20%";

function formatCents(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

const PROMOTE_ITEMS = [
  "Learn AI evaluation & AI training skills",
  "Practise AI evaluation tasks & assessments",
  "Prepare for AI evaluation interviews",
  "Discover AI training opportunities",
];

const TERMS_SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Eligibility",
    body: "Anyone with a Global Ready AIEval account can join the Affiliate Program. There is no application fee and no approval wait — your referral link is active as soon as you join.",
  },
  {
    title: "2. Commission & Qualifying Sales",
    body: "You earn your commission rate on the sale price of any paid plan or credit pack purchased by someone who used your referral link, on their first purchase through that link.",
  },
  {
    title: "3. Commission Payments",
    body: "Approved commissions are tracked in your dashboard as Pending until reviewed, then marked Paid Out once settled. Payment timing and method are communicated directly by the Global Ready AIEval team — this program does not currently run on a fixed automatic payout schedule.",
  },
  {
    title: "4. Refunds & Chargebacks",
    body: "If a referred purchase is refunded or charged back, any commission tied to that sale is voided, including if it was already marked as paid — it will be deducted from a future payout.",
  },
  {
    title: "5. No Self-Referrals",
    body: "You may not use your own referral link to purchase a plan for yourself, or create accounts to generate artificial referrals. Commissions from self-referrals will be voided.",
  },
  {
    title: "6. Affiliate Disclosure",
    body: "Whenever you share your referral link, you must clearly disclose that you may earn a commission — see the disclosure notice above for suggested wording.",
  },
  {
    title: "7. No Spam & No Fake Claims",
    body: "Do not use unsolicited bulk messaging (email, DM, or comment spam) to share your link, and do not make false or exaggerated claims about outcomes, earnings, or guarantees.",
  },
  {
    title: "8. Third-Party Platforms",
    body: "Global Ready AIEval is an independent training platform. Do not tell people we are officially affiliated with Mercor, Outlier, Alignerr, Micro1, or any other third-party platform unless we expressly state otherwise.",
  },
  {
    title: "9. Brand Use",
    body: "You may reference the Global Ready AIEval name and describe the product accurately, but may not imply you are an employee or official representative of the company, and may not modify our logo or branding.",
  },
  {
    title: "10. Program Abuse",
    body: "We reserve the right to disable an affiliate account and void pending commissions if we find evidence of fraud, self-referral, or any other abuse of the program.",
  },
  {
    title: "11. Changes to the Program",
    body: "Commission rates and program terms may change going forward. Changes apply to new referrals only — commission already earned on a completed sale is not affected retroactively.",
  },
  {
    title: "12. Ending Participation",
    body: "You may stop participating at any time by no longer sharing your link. We may also disable an affiliate account at our discretion. Commission already earned on valid, non-refunded sales prior to disabling remains payable.",
  },
  {
    title: "13. Contact",
    body: "Questions about the Affiliate Program can be sent to contact@globalready.tech.",
  },
];

export default function AffiliateView({ onBack }: { onBack: () => void }) {
  const [affiliateStatus, setAffiliateStatus] = useState<AffiliateStatus | null>(null);
  const [referralSummary, setReferralSummary] = useState<AffiliateReferralSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBecomingAffiliate, setIsBecomingAffiliate] = useState(false);
  const [affiliateError, setAffiliateError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyAffiliateStatus().then((status) => {
      if (cancelled) return;
      setAffiliateStatus(status);
      setIsLoading(false);
      if (status) {
        getMyReferralSummary().then((summary) => {
          if (!cancelled) setReferralSummary(summary);
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const referralLink =
    affiliateStatus && typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${affiliateStatus.code}`
      : "";

  const rateLabel = affiliateStatus ? `${Math.round(affiliateStatus.commissionRate * 100)}%` : DEFAULT_COMMISSION_LABEL;

  const handleBecomeAffiliate = async () => {
    setAffiliateError("");
    setIsBecomingAffiliate(true);
    const result = await becomeAffiliate();
    setIsBecomingAffiliate(false);

    if (result.error) {
      setAffiliateError(result.error);
      return;
    }
    const status = await getMyAffiliateStatus();
    setAffiliateStatus(status);
    const summary = await getMyReferralSummary();
    setReferralSummary(summary);
  };

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pl-1 space-y-6 animate-fade-in pb-16">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Career Hub
      </button>

      {/* Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Affiliate Program
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Share Global Ready AIEval. Earn <span className="text-indigo-600 dark:text-indigo-400">{rateLabel}</span>.
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          Help more people discover practical AI evaluation training and earn a {rateLabel} commission on every qualifying sale you refer.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 py-2">
            <Gift className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">No setup fee — it&apos;s free to join</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 py-2">
            <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Your link — ready to share</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 py-2">
            <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Track referrals & earnings live</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Link2, label: "Copy Your Link", desc: "Grab your unique affiliate link below." },
            { icon: Share2, label: "Share It", desc: "Share it with your audience on any platform." },
            { icon: Sparkles, label: `Earn ${rateLabel}`, desc: "You earn commission when someone makes a qualifying purchase." },
            { icon: Wallet, label: "Track Earnings", desc: "Watch pending and paid commissions in your dashboard." },
          ].map((step) => (
            <div key={step.label} className="text-center space-y-2">
              <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
                <step.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{step.label}</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Link + stats / join CTA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        {isLoading ? (
          <p className="text-xs text-slate-400">Loading...</p>
        ) : !affiliateStatus ? (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
              <Gift className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Ready to start earning?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Get your own referral link and earn {rateLabel} of every qualifying sale you bring in — no application needed.
              </p>
            </div>
            {affiliateError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-405 font-bold flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {affiliateError}
              </p>
            )}
            <button
              type="button"
              onClick={handleBecomeAffiliate}
              disabled={isBecomingAffiliate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {isBecomingAffiliate && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Become an Affiliate
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5">
                Your Affiliate Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCopyReferralLink}
                  title="Copy link"
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copySuccess ? "Copied" : "Copy Link"}
                </button>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1.5">
                Share this link and earn {rateLabel} commission on qualifying sales.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Rate</span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-1.5 block">{rateLabel}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Referrals</span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-1.5 block">{referralSummary?.referrals.length ?? 0}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Pending</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1.5 block">{formatCents(referralSummary?.pendingCommissionCents ?? 0)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Paid Out</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block">{formatCents(referralSummary?.paidCommissionCents ?? 0)}</span>
              </div>
            </div>

            {affiliateStatus.status === "disabled" && (
              <p className="text-[11px] text-rose-600 dark:text-rose-405 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Your affiliate account is currently disabled — new referrals won&apos;t earn commission.
              </p>
            )}
          </div>
        )}
      </div>

      {/* What can you promote / disclosure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What Can You Promote?
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">You can share Global Ready AIEval with people who want to:</p>
          <ul className="space-y-1.5">
            {PROMOTE_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-350">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300">Important:</strong> Global Ready AIEval is an independent training platform. Do not tell people we are officially affiliated with Mercor, Outlier, Alignerr, Micro1, or any other platform unless we expressly state otherwise.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-indigo-500" /> Affiliate Disclosure
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Whenever you share your referral link, clearly disclose that you may earn a commission.
          </p>
          <blockquote className="border-l-2 border-indigo-300 dark:border-indigo-700 pl-3 text-[11px] italic text-slate-600 dark:text-slate-350">
            &ldquo;Affiliate link: I may earn a commission if you purchase through this link, at no additional cost to you.&rdquo;
          </blockquote>
          <p className="text-[10px] text-slate-450 dark:text-slate-500">
            Place this disclosure near your link or recommendation in your content.
          </p>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
          Affiliate Program Terms
        </h3>
        {TERMS_SECTIONS.map((section) => (
          <details key={section.title} className="group border-b border-slate-100 dark:border-slate-850 last:border-0 py-2">
            <summary className="cursor-pointer list-none flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
              {section.title}
              <span className="text-slate-400 transition-transform group-open:rotate-180 shrink-0 ml-2">▾</span>
            </summary>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{section.body}</p>
          </details>
        ))}
        <p className="text-[10px] text-slate-450 dark:text-slate-500 pt-3">
          Questions about the program? Reach out anytime at{" "}
          <a href="mailto:contact@globalready.tech" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            contact@globalready.tech
          </a>
          .
        </p>
      </div>

      {affiliateStatus && (
        <div className="bg-indigo-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-black text-white">Ready to start earning?</p>
            <p className="text-xs text-indigo-100 mt-0.5">
              Copy your link, share Global Ready AIEval with the right people, and earn {rateLabel} on qualifying sales.
            </p>
          </div>
          <button
            onClick={handleCopyReferralLink}
            className="shrink-0 bg-white hover:bg-indigo-50 text-indigo-600 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copySuccess ? "Copied!" : "Copy My Affiliate Link"}
          </button>
        </div>
      )}
    </div>
  );
}
