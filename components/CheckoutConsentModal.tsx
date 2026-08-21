"use client";

import { useState } from "react";
import { Loader2, X, Check } from "lucide-react";
import { TERMS_CONSENT_TEXT, getSecondConsentText } from "@/lib/checkout-consent";

export interface CheckoutOrderSummary {
  productName: string;
  priceDisplay: string;
  whatYouGet: string;
  // Which consent wording applies — coaching is a scheduled personal
  // service (early service start), everything else is immediate digital
  // access. See lib/checkout-consent.ts.
  product: string;
}

export default function CheckoutConsentModal({
  order,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  order: CheckoutOrderSummary;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [secondAccepted, setSecondAccepted] = useState(false);
  const canSubmit = termsAccepted && secondAccepted && !isSubmitting;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Confirm Your Order</h2>
          <button
            onClick={onCancel}
            className="shrink-0 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order summary — DEVELOPER_COMPLIANCE.MD §8 */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Product</span>
            <span className="font-bold text-slate-900 dark:text-white">{order.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Price</span>
            <span className="font-bold text-slate-900 dark:text-white">{order.priceDisplay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment</span>
            <span className="font-bold text-slate-900 dark:text-white">One-time payment</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Automatic renewal</span>
            <span className="font-bold text-slate-900 dark:text-white">None</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 mt-1.5">
            <span className="text-slate-500">What you receive: </span>
            <span className="text-slate-700 dark:text-slate-300">{order.whatYouGet}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
              I have read and agree to the{" "}
              <a href="/terms" target="_blank" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Terms of Service
              </a>{" "}
              and acknowledge the{" "}
              <a href="/privacy" target="_blank" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/refunds" target="_blank" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Refund, Cancellation &amp; Withdrawal Policy
              </a>
              .
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={secondAccepted}
              onChange={(e) => setSecondAccepted(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
              {getSecondConsentText(order.product)}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Order and Pay {order.priceDisplay}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
