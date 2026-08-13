"use server";

import { cookies, headers } from "next/headers";
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

// Reads the "gr_ref" cookie (set by middleware from a "?ref=" link) and
// resolves it to an active affiliate — using the service client since the
// buyer looking this up is never the affiliate's own row, which the
// owner-only RLS policy on `affiliates` would otherwise block. Self-referral
// and disabled affiliates are both silently ignored rather than erroring —
// checkout should never fail because of a stale/invalid referral code.
async function resolveAffiliateCode(buyerUserId: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  const refCode = cookieStore.get("gr_ref")?.value;
  if (!refCode) return undefined;

  const service = createServiceClient();
  const { data: affiliate } = await service
    .from("affiliates")
    .select("user_id, status")
    .eq("code", refCode)
    .maybeSingle();

  if (!affiliate || affiliate.status !== "active" || affiliate.user_id === buyerUserId) {
    return undefined;
  }
  return refCode;
}

export type OneTimeCheckoutProduct =
  | "starter"
  | "professional"
  | "career_accelerator"
  | "credit_pack_a"
  | "credit_pack_b";

async function resolveOneTimeProduct(product: OneTimeCheckoutProduct): Promise<OneTimeProduct> {
  if (product !== "professional") {
    if (product === "starter") return "tier_starter";
    if (product === "career_accelerator") return "tier_career_accelerator";
    return product;
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

export async function createOneTimeCheckout(
  product: OneTimeCheckoutProduct,
  quantity: number = 1,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");

  // Only credit packs can be bought in bulk — tier purchases (starter,
  // professional) are always exactly one. Clamp defensively since this is
  // a public-callable action taking a client-supplied number.
  const isCreditPack = product === "credit_pack_a" || product === "credit_pack_b";
  const safeQuantity = isCreditPack ? Math.min(20, Math.max(1, Math.floor(quantity) || 1)) : 1;

  const [origin, customerId, resolvedProduct, affiliateCode] = await Promise.all([
    getOrigin(),
    getOrCreateStripeCustomerId(user.id, user.email),
    resolveOneTimeProduct(product),
    resolveAffiliateCode(user.id),
  ]);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: getOneTimePriceId(resolvedProduct), quantity: safeQuantity }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    // Lets the Stripe-hosted checkout page show a "Add promotion code" field
    // (e.g. for the Career Accelerator discount coupon).
    allow_promotion_codes: true,
    payment_intent_data: {
      metadata: {
        supabase_user_id: user.id,
        product_type: resolvedProduct,
        quantity: String(safeQuantity),
        ...(affiliateCode && { affiliate_code: affiliateCode }),
      },
    },
    metadata: {
      supabase_user_id: user.id,
      product_type: resolvedProduct,
      quantity: String(safeQuantity),
      ...(affiliateCode && { affiliate_code: affiliateCode }),
    },
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

  const [origin, customerId, affiliateCode] = await Promise.all([
    getOrigin(),
    getOrCreateStripeCustomerId(user.id, user.email),
    resolveAffiliateCode(user.id),
  ]);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: getAcceleratorPriceId(), quantity: 1 }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    // Lets the Stripe-hosted checkout page show a "Add promotion code" field
    // so the coupon/promo code you create in Stripe can actually be redeemed.
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: user.id, ...(affiliateCode && { affiliate_code: affiliateCode }) },
    },
    metadata: { supabase_user_id: user.id, ...(affiliateCode && { affiliate_code: affiliateCode }) },
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
