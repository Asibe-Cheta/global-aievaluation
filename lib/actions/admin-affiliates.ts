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

export async function markReferralPaid(referralId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliate_referrals")
    .update({ status: "paid" })
    .eq("id", referralId);
  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return {};
}

export async function markAllReferralsPaid(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("affiliate_referrals")
    .update({ status: "paid" })
    .eq("affiliate_user_id", userId)
    .eq("status", "pending");
  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return {};
}
