"use server";

import { createClient } from "@/lib/supabase/server";

export interface AffiliateStatus {
  code: string;
  commissionRate: number;
  status: "active" | "disabled";
}

export interface AffiliateReferral {
  id: string;
  productType: string | null;
  saleAmountCents: number;
  commissionCents: number;
  currency: string;
  status: "pending" | "paid";
  createdAt: string;
}

export interface AffiliateReferralSummary {
  referrals: AffiliateReferral[];
  pendingCommissionCents: number;
  paidCommissionCents: number;
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function getMyAffiliateStatus(): Promise<AffiliateStatus | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("affiliates")
    .select("code, commission_rate, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return { code: data.code, commissionRate: data.commission_rate, status: data.status };
}

export async function becomeAffiliate(): Promise<{ error?: string; code?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await getMyAffiliateStatus();
  if (existing) return { code: existing.code };

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { error } = await supabase.from("affiliates").insert({
      user_id: user.id,
      code,
    });
    if (!error) return { code };
    if (error.code !== "23505") return { error: error.message };
    // Unique violation on the generated code — regenerate and retry.
  }

  return { error: "Could not generate a unique referral code. Please try again." };
}

export async function getMyReferralSummary(): Promise<AffiliateReferralSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { referrals: [], pendingCommissionCents: 0, paidCommissionCents: 0 };

  const { data } = await supabase
    .from("affiliate_referrals")
    .select("id, product_type, sale_amount_cents, commission_cents, currency, status, created_at")
    .eq("affiliate_user_id", user.id)
    .order("created_at", { ascending: false });

  const referrals: AffiliateReferral[] = (data ?? []).map((r) => ({
    id: r.id,
    productType: r.product_type,
    saleAmountCents: r.sale_amount_cents,
    commissionCents: r.commission_cents,
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
  }));

  return {
    referrals,
    pendingCommissionCents: referrals
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + r.commissionCents, 0),
    paidCommissionCents: referrals
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + r.commissionCents, 0),
  };
}
