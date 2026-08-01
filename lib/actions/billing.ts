"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getStripe,
  getOneTimePriceId,
  getAcceleratorPriceId,
  type OneTimeProduct,
} from "@/lib/stripe";
import { PROFESSIONAL_FOUNDING_LIMIT } from "@/lib/pricing";

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
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  const { error } = await service.from("stripe_customers").upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });
  if (error) throw new Error(`getOrCreateStripeCustomerId: ${error.message}`);

  return customer.id;
}

export type OneTimeCheckoutProduct = "starter" | "professional" | "credit_pack_a" | "credit_pack_b";

async function resolveOneTimeProduct(product: OneTimeCheckoutProduct): Promise<OneTimeProduct> {
  if (product !== "professional") {
    return product === "starter" ? "tier_starter" : product;
  }

  const service = createServiceClient();
  const { count } = await service
    .from("purchases")
    .select("*", { count: "exact", head: true })
    .eq("product_type", "tier_professional_founding")
    .eq("status", "completed");

  return (count ?? 0) < PROFESSIONAL_FOUNDING_LIMIT
    ? "tier_professional_founding"
    : "tier_professional_regular";
}

export async function createOneTimeCheckout(product: OneTimeCheckoutProduct) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");

  const [origin, customerId, resolvedProduct] = await Promise.all([
    getOrigin(),
    getOrCreateStripeCustomerId(user.id, user.email),
    resolveOneTimeProduct(product),
  ]);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: getOneTimePriceId(resolvedProduct), quantity: 1 }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    payment_intent_data: {
      metadata: { supabase_user_id: user.id, product_type: resolvedProduct },
    },
    metadata: { supabase_user_id: user.id, product_type: resolvedProduct },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function createSubscriptionCheckout() {
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
    line_items: [{ price: getAcceleratorPriceId(), quantity: 1 }],
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
    .from("stripe_customers")
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
