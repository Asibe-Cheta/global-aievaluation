"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAffiliateCommissionRate(
  userId: string,
  ratePercent: number,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const rate = Math.max(0, Math.min(100, ratePercent)) / 100;

  const { error } = await supabase
    .from("affiliates")
    .update({ commission_rate: rate })
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return {};
}

export async function setAffiliateStatus(
  userId: string,
  status: "active" | "disabled",
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("affiliates").update({ status }).eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return {};
}

export type AffiliateReferralStatus = "pending" | "approved" | "paid" | "reversed" | "cancelled";

export async function setReferralStatus(
  referralId: string,
  status: AffiliateReferralStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliate_referrals")
    .update({ status })
    .eq("id", referralId);
  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return {};
}

// Kept as a named action (rather than a loop of setReferralStatus calls
// from the client) so the "mark everything ready for this week's payout"
// action is a single atomic update — matches the Weekly Payouts terms:
// pending and approved referrals both move to paid in one pass.
export async function markAllReferralsPaid(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliate_referrals")
    .update({ status: "paid" })
    .eq("affiliate_user_id", userId)
    .in("status", ["pending", "approved"]);
  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return {};
}
