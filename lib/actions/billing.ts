"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe, getPriceId, type PaidTier, type BillingPeriod } from "@/lib/stripe";

async function getOrigin(): Promise<string> {
  const hdrs = await headers();
  const origin = hdrs.get("origin");
  if (origin) return origin;
  const host = hdrs.get("host");
  return `https://${host}`;
}

async function getOrCreateStripeCustomerId(
  userId: string,
  email: string,
): Promise<string> {
  const service = createServiceClient();

  const { data: existing } = await service
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  const { error } = await service.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });
  if (error) throw new Error(`getOrCreateStripeCustomerId: ${error.message}`);

  return customer.id;
}

export async function createCheckoutSession(
  tier: PaidTier,
  billingPeriod: BillingPeriod,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");

  const [origin, customerId] = await Promise.all([
    getOrigin(),
    getOrCreateStripeCustomerId(user.id, user.email),
  ]);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: getPriceId(tier, billingPeriod), quantity: 1 }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function createPortalSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const service = createServiceClient();
  const { data } = await service
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    throw new Error("No billing account found — subscribe to a plan first.");
  }

  const origin = await getOrigin();
  const session = await getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${origin}/?checkout=return`,
  });

  redirect(session.url);
}
