import type Stripe from "stripe";
import { isAcceleratorPrice, type OneTimeProduct } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

// Shared by the Stripe webhook (app/api/stripe/webhook/route.ts) and the
// self-serve "sync my purchases" server action (lib/actions/billing.ts) —
// the webhook is the primary path, but a missed/delayed/misconfigured
// webhook shouldn't be the only way a paying user's tier ever updates, so
// the same idempotent logic is reachable on-demand too.

type ServiceClient = ReturnType<typeof createServiceClient>;

// Effective membership tier is derived from two independent facts: which
// one-time tiers a user owns forever (purchases), and whether their Career
// Accelerator subscription is currently active (subscriptions). Recomputing
// from scratch — rather than trusting whatever the last webhook event said —
// is what correctly handles cancellation (fall back to an owned one-time
// tier, not a hardcoded default) and stacking (Accelerator active on top of
// an owned Professional purchase).
export async function recomputeMembershipTier(service: ServiceClient, userId: string) {
  const [{ data: sub }, { data: purchases }] = await Promise.all([
    service
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle(),
    service
      .from("purchases")
      .select("product_type")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  // acceleratorActive covers a real (legacy) Stripe Subscription;
  // ownsAccelerator covers the current one-time-purchase model. Either one
  // grants the tier — a lapsed/canceled legacy subscription with no
  // one-time purchase correctly falls back below.
  const acceleratorActive = sub?.status === "active" || sub?.status === "trialing";
  const ownedTypes = new Set((purchases ?? []).map((p) => p.product_type));
  const ownsAccelerator = ownedTypes.has("tier_career_accelerator");
  const ownsProfessional =
    ownedTypes.has("tier_professional_founding") || ownedTypes.has("tier_professional_regular");
  const ownsStarter = ownedTypes.has("tier_starter");

  const tier = acceleratorActive || ownsAccelerator
    ? "career_accelerator"
    : ownsProfessional
      ? "professional"
      : ownsStarter
        ? "starter"
        : "free";

  const { error: profileError } = await service
    .from("profiles")
    .update({ membership_tier: tier })
    .eq("id", userId);
  if (profileError) console.error("Stripe sync: profile update failed", profileError);

  // monthly_allotment reflects the currently *effective* tier only (not a
  // sum) — 50 for Accelerator (active subscription or owned outright), drops
  // to 30 automatically if a legacy subscription lapses since Professional
  // ownership persists separately.
  const monthlyAllotment = acceleratorActive || ownsAccelerator ? 50 : ownsProfessional ? 30 : 0;
  const { error: creditsError } = await service
    .from("interview_credits")
    .update({ monthly_allotment: monthlyAllotment })
    .eq("user_id", userId);
  if (creditsError) console.error("Stripe sync: interview_credits update failed", creditsError);

  return tier;
}

export async function syncSubscriptionState(subscription: Stripe.Subscription) {
  const service = createServiceClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const { data: existing } = await service
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  const userId = existing?.user_id ?? subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error(`Stripe sync: no user found for customer ${customerId}`);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const isAccelerator = priceId ? isAcceleratorPrice(priceId) : false;
  const isActive = subscription.status === "active" || subscription.status === "trialing";

  const { error: subError } = await service.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    tier: isActive && isAccelerator ? "career_accelerator" : null,
    billing_period: isActive && isAccelerator ? "monthly" : null,
    status: subscription.status,
    current_period_end: item
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  });
  if (subError) console.error("Stripe sync: subscriptions upsert failed", subError);

  await recomputeMembershipTier(service, userId);
}

export async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const service = createServiceClient();
  const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;
  const productType = session.metadata?.product_type as OneTimeProduct | undefined;

  if (!userId || !productType) {
    console.error(
      `Stripe sync: one-time payment ${session.id} missing supabase_user_id/product_type metadata`,
    );
    return;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const { data: inserted, error: insertError } = await service
    .from("purchases")
    .insert({
      user_id: userId,
      stripe_customer_id: customerId ?? null,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId ?? null,
      product_type: productType,
      amount_cents: session.amount_total ?? null,
      currency: session.currency ?? "eur",
    })
    .select()
    .maybeSingle();

  if (insertError) {
    // Unique violation on stripe_checkout_session_id means this event was
    // already processed (Stripe retries webhooks, or the self-serve sync
    // action re-lists the same session) — safe to skip the credit grant,
    // but still recompute the tier in case a prior attempt inserted the
    // purchase but failed before reaching that step.
    if (insertError.code === "23505") {
      await recomputeMembershipTier(service, userId);
      return;
    }
    console.error("Stripe sync: purchases insert failed", insertError);
    return;
  }
  if (!inserted) return;

  // Quantity only ever varies for credit packs (createOneTimeCheckout clamps
  // it to 1 for every other product) — Stripe already prices amount_total
  // correctly for quantity:N line items, so this is purely for multiplying
  // the credits granted, not anything payment-related.
  const quantity = Math.max(1, Number(session.metadata?.quantity ?? "1") || 1);

  if (productType === "tier_starter") {
    await service.rpc("grant_interview_credits", { p_user_id: userId, p_one_time: 10, p_topup: 0 });
  } else if (productType === "credit_pack_a") {
    await service.rpc("grant_interview_credits", { p_user_id: userId, p_one_time: 0, p_topup: 15 * quantity });
  } else if (productType === "credit_pack_b") {
    await service.rpc("grant_interview_credits", { p_user_id: userId, p_one_time: 0, p_topup: 35 * quantity });
  }
  // tier_professional_founding / tier_professional_regular: monthly_allotment
  // is set inside recomputeMembershipTier() below (it's derived from
  // ownership, not an incremental grant).

  await recomputeMembershipTier(service, userId);
}

// Commission is recorded once, at the same "checkout.session.completed"
// moment as any other sale — first payment only, no ongoing commission on
// subscription renewals (those don't go through Checkout again). The
// affiliate code was already validated (active, not self-referral) when the
// Checkout Session was created in lib/actions/billing.ts, but this is the
// real trust boundary, so it's re-checked here rather than trusted blindly.
export async function recordAffiliateCommission(session: Stripe.Checkout.Session) {
  const affiliateCode = session.metadata?.affiliate_code;
  if (!affiliateCode) return;

  const buyerUserId = session.metadata?.supabase_user_id ?? session.client_reference_id;
  if (!buyerUserId) return;

  const service = createServiceClient();
  const { data: affiliate } = await service
    .from("affiliates")
    .select("user_id, commission_rate, status")
    .eq("code", affiliateCode)
    .maybeSingle();

  if (!affiliate || affiliate.status !== "active" || affiliate.user_id === buyerUserId) return;

  const saleAmountCents = session.amount_total ?? 0;
  const commissionCents = Math.round(saleAmountCents * affiliate.commission_rate);
  const productType =
    session.metadata?.product_type ?? (session.mode === "subscription" ? "career_accelerator" : null);

  const { error } = await service.from("affiliate_referrals").insert({
    affiliate_user_id: affiliate.user_id,
    referred_user_id: buyerUserId,
    stripe_checkout_session_id: session.id,
    product_type: productType,
    sale_amount_cents: saleAmountCents,
    commission_cents: commissionCents,
    currency: session.currency ?? "eur",
  });

  if (error) {
    // Unique violation on stripe_checkout_session_id means this event was
    // already processed — safe to skip.
    if (error.code === "23505") return;
    console.error("Stripe sync: affiliate_referrals insert failed", error);
  }
}
