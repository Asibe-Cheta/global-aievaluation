import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminAffiliate, getAdminAffiliateReferrals } from "@/lib/admin/queries";
import { MarkPaidButton, MarkAllPaidButton } from "../AffiliateControls";

function formatCents(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export default async function AdminAffiliateLedgerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [affiliate, referrals] = await Promise.all([
    getAdminAffiliate(userId),
    getAdminAffiliateReferrals(userId),
  ]);

  if (!affiliate) notFound();

  const hasPending = referrals.some((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/affiliates"
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Affiliates
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {affiliate.display_name ?? affiliate.user_id}
          </h2>
          <p className="text-xs text-slate-450 mt-1 font-mono">
            Code: {affiliate.code} · {Math.round(affiliate.commission_rate * 100)}% commission
          </p>
        </div>
        {hasPending && <MarkAllPaidButton userId={userId} />}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Sale Amount</th>
              <th className="text-left px-4 py-3">Commission</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {referrals.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {r.product_type ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatCents(r.sale_amount_cents)}
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  {formatCents(r.commission_cents)}
                </td>
                <td className="px-4 py-3">
                  {r.status === "paid" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Paid</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "pending" && <MarkPaidButton referralId={r.id} />}
                </td>
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No referrals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
