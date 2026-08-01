"use server";

import { createClient } from "@/lib/supabase/server";

// Both RPCs run as the authenticated caller (auth.uid() internally, no
// user-id argument) — see supabase/migrations/0014_lock_down_credit_rpcs.sql.

export async function getInterviewCreditBalance(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("get_interview_credit_balance");
  if (error) throw new Error(`getInterviewCreditBalance: ${error.message}`);
  return data ?? 0;
}

export interface StartInterviewSessionResult {
  ok: boolean;
  remaining: number;
}

// Atomically spends one interview credit for the current session. Checks
// the balance first so a user with zero credits gets a clean "out of
// credits" result instead of hitting the RPC (which would just no-op).
export async function startInterviewSession(): Promise<StartInterviewSessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const balance = await getInterviewCreditBalance();
  if (balance <= 0) {
    return { ok: false, remaining: 0 };
  }

  const { error } = await supabase.rpc("consume_interview_credit");
  if (error) throw new Error(`startInterviewSession: ${error.message}`);

  const remaining = await getInterviewCreditBalance();
  return { ok: true, remaining };
}
