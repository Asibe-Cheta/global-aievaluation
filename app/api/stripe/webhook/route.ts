import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isAcceleratorPrice, type OneTimeProduct } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type ServiceClient = ReturnType<typeof createServiceClient>;

// Effective membership tier is derived from two independent facts: which
// one-time tiers a user owns forever (purchases), and whether their Career
// Accelerator subscription is currently active (subscriptions). Recomputing
// from scratch — rather than trusting whatever the last webhook event said —
// is what correctly handles cancellation (fall back to an owned one-time
// tier, not a hardcoded default) and stacking (Accelerator active on top of
// an owned Professional purchase).
async function recomputeMembershipTier(service: ServiceClient, userId: string) {
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

  const acceleratorActive = sub?.status === "active" || sub?.status === "trialing";
  const ownedTypes = new Set((purchases ?? []).map((p) => p.product_type));
  const ownsProfessional =
    ownedTypes.has("tier_professional_founding") || ownedTypes.has("tier_professional_regular");
  const ownsStarter = ownedTypes.has("tier_starter");

  const tier = acceleratorActive
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
  if (profileError) console.error("Stripe webhook: profile update failed", profileError);

  // monthly_allotment reflects the currently *effective* tier only (not a
  // sum) — 50 while Accelerator is active, drops to 30 automatically once
  // it lapses since Professional ownership persists separately.
  const monthlyAllotment = acceleratorActive ? 50 : ownsProfessional ? 30 : 0;
  const { error: creditsError } = await service
    .from("interview_credits")
    .update({ monthly_allotment: monthlyAllotment })
    .eq("user_id", userId);
  if (creditsError) console.error("Stripe webhook: interview_credits update failed", creditsError);
}

async function syncSubscriptionState(subscription: Stripe.Subscription) {
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
    console.error(`Stripe webhook: no user found for customer ${customerId}`);
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
  if (subError) console.error("Stripe webhook: subscriptions upsert failed", subError);

  await recomputeMembershipTier(service, userId);
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const service = createServiceClient();
  const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;
  const productType = session.metadata?.product_type as OneTimeProduct | undefined;

  if (!userId || !productType) {
    console.error(
      `Stripe webhook: one-time payment ${session.id} missing supabase_user_id/product_type metadata`,
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
    // already processed (Stripe retries webhooks) — safe to skip.
    if (insertError.code === "23505") return;
    console.error("Stripe webhook: purchases insert failed", insertError);
    return;
  }
  if (!inserted) return;

  if (productType === "tier_starter") {
    await service.rpc("grant_interview_credits", { p_user_id: userId, p_one_time: 10, p_topup: 0 });
  } else if (productType === "credit_pack_a") {
    await service.rpc("grant_interview_credits", { p_user_id: userId, p_one_time: 0, p_topup: 15 });
  } else if (productType === "credit_pack_b") {
    await service.rpc("grant_interview_credits", { p_user_id: userId, p_one_time: 0, p_topup: 35 });
  }
  // tier_professional_founding / tier_professional_regular: monthly_allotment
  // is set inside recomputeMembershipTier() below (it's derived from
  // ownership, not an incremental grant).

  await recomputeMembershipTier(service, userId);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          await syncSubscriptionState(subscription);
        } else if (session.mode === "payment") {
          await handleOneTimePayment(session);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionState(subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook: failed handling ${event.type}`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
