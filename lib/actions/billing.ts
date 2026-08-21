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
import { handleOneTimePayment, recomputeMembershipTier, syncSubscriptionState } from "@/lib/stripe/sync";
import {
  CONSENT_VERSION,
  TERMS_CONSENT_TEXT,
  getSecondConsentText,
  getSecondConsentType,
} from "@/lib/checkout-consent";
import type { UserStats } from "@/types";

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
  | "credit_pack_b"
  | "coaching";

async function resolveOneTimeProduct(product: OneTimeCheckoutProduct): Promise<OneTimeProduct> {
  if (product !== "professional") {
    if (product === "starter") return "tier_starter";
    if (product === "career_accelerator") return "tier_career_accelerator";
    if (product === "coaching") return "coaching_session";
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

// Both checkboxes are required before this action will create a Stripe
// session — see components/CheckoutConsentModal.tsx for the UI that
// collects them and legal-source/DEVELOPER_COMPLIANCE.MD §6/§14 for why:
// German law requires express, logged consent to immediate digital
// delivery (or, for coaching, early service start) before the statutory
// 14-day withdrawal right can be considered validly waived. This is
// re-checked here rather than trusted from the client, since a client that
// skips the modal is exactly the case this exists to prevent.
export interface CheckoutConsent {
  termsAccepted: boolean;
  secondConsentAccepted: boolean;
}

export async function createOneTimeCheckout(
  product: OneTimeCheckoutProduct,
  quantity: number = 1,
  consent?: CheckoutConsent,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");

  if (!consent?.termsAccepted || !consent?.secondConsentAccepted) {
    throw new Error("Please accept both checkout agreements before continuing.");
  }

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

  const service = createServiceClient();
  const { error: consentError } = await service.from("legal_consents").insert([
    {
      user_id: user.id,
      consent_type: "terms",
      version: CONSENT_VERSION,
      wording: TERMS_CONSENT_TEXT,
      accepted: true,
      order_reference: `checkout:${resolvedProduct}`,
    },
    {
      user_id: user.id,
      consent_type: getSecondConsentType(product),
      version: CONSENT_VERSION,
      wording: getSecondConsentText(product),
      accepted: true,
      order_reference: `checkout:${resolvedProduct}`,
    },
  ]);
  if (consentError) throw new Error(`Failed to record checkout consent: ${consentError.message}`);

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

// Self-serve fallback for when the Stripe webhook is delayed, misconfigured,
// or simply never lands (e.g. the webhook secret drifted out of sync with
// what's configured in the Stripe Dashboard — see app/api/stripe/webhook —
// which silently failed every event until it was caught) — a user who paid
// but is still stuck on "free" shouldn't have to wait on us to notice.
// Re-lists their own recent Checkout Sessions directly from Stripe and
// replays whichever ones the webhook would have processed, using the exact
// same idempotent logic so this is always safe to call, including when
// there's genuinely nothing new to sync.
export interface LatestPurchase {
  productType: string;
  amountCents: number | null;
  currency: string;
  orderReference: string;
  createdAt: string;
}

export async function syncMyPurchases(): Promise<{
  membershipTier: UserStats["membershipTier"];
  syncedCount: number;
  latestPurchase: LatestPurchase | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const service = createServiceClient();
  const { data: customerRow } = await service
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let syncedCount = 0;

  if (customerRow?.stripe_customer_id) {
    const sessions = await getStripe().checkout.sessions.list({
      customer: customerRow.stripe_customer_id,
      limit: 20,
    });

    for (const session of sessions.data) {
      if (session.status !== "complete" || session.payment_status !== "paid") continue;

      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        await syncSubscriptionState(subscription);
        syncedCount++;
      } else if (session.mode === "payment") {
        await handleOneTimePayment(session);
        syncedCount++;
      }
    }
  }

  // Always recompute, even with nothing new to sync — cheap, and covers the
  // case where a purchase row already exists but a prior tier update failed.
  const membershipTier = await recomputeMembershipTier(service, user.id);

  const { data: latestRow } = await service
    .from("purchases")
    .select("product_type, amount_cents, currency, stripe_checkout_session_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestPurchase: LatestPurchase | null = latestRow
    ? {
        productType: latestRow.product_type,
        amountCents: latestRow.amount_cents,
        currency: latestRow.currency,
        orderReference: latestRow.stripe_checkout_session_id,
        createdAt: latestRow.created_at,
      }
    : null;

  return { membershipTier: membershipTier as UserStats["membershipTier"], syncedCount, latestPurchase };
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
