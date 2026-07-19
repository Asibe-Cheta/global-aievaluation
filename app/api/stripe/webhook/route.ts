import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, tierAndPeriodForPrice } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

async function syncSubscriptionState(subscription: Stripe.Subscription) {
  const service = createServiceClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const { data: existing } = await service
    .from("subscriptions")
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
  const mapping = priceId ? tierAndPeriodForPrice(priceId) : null;
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const tier = isActive && mapping ? mapping.tier : "starter";

  const { error: subError } = await service.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    tier: isActive ? mapping?.tier ?? null : null,
    billing_period: isActive ? mapping?.billingPeriod ?? null : null,
    status: subscription.status,
    current_period_end: item
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  });
  if (subError) console.error("Stripe webhook: subscriptions upsert failed", subError);

  const { error: profileError } = await service
    .from("profiles")
    .update({ membership_tier: tier })
    .eq("id", userId);
  if (profileError) console.error("Stripe webhook: profile update failed", profileError);
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
