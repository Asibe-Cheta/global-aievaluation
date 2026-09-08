import Stripe from "stripe";

// Constructed lazily so the app still builds/boots before Stripe keys exist
// (matches the GEMINI_API_KEY pattern in app/api/parse-resume/route.ts).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local.");
    }
    _stripe = new Stripe(apiKey);
  }
  return _stripe;
}

// One-time purchases: Starter, Professional (founding or regular price),
// Career Accelerator (a 2-week program, sold as a one-time purchase like
// Starter/Professional — pay once, keep access), both AI credit top-up
// packs, and the 1-to-1 Coaching add-on. "coaching_session" is deliberately
// not "tier_..." — it's a paid service, not a membership tier, and doesn't
// change membership_tier (see recomputeMembershipTier in the Stripe
// webhook, which only checks for "tier_..." product types).
export type OneTimeProduct =
  | "tier_starter"
  | "tier_professional_founding"
  | "tier_professional_regular"
  | "tier_career_accelerator"
  | "credit_pack_a"
  | "credit_pack_b"
  | "coaching_session";

// Looked up at call time (process.env[key]) so Vercel runtime env is used
// rather than a value captured when this module first loaded.
const ONE_TIME_PRICE_ENV: Record<OneTimeProduct, string> = {
  tier_starter: "STRIPE_PRICE_STARTER",
  tier_professional_founding: "STRIPE_PRICE_PROFESSIONAL_FOUNDING",
  tier_professional_regular: "STRIPE_PRICE_PROFESSIONAL_REGULAR",
  // Deliberately its own env var, distinct from STRIPE_PRICE_ACCELERATOR_MONTHLY
  // below — that one is a *recurring* price still used by legacy real
  // subscribers (getAcceleratorPriceId), and a single Stripe Price object
  // can't be both recurring and one-time. Reusing one var for both silently
  // broke new one-time Accelerator checkouts ("payment mode but passed a
  // recurring price"). oneTimeCheckoutLineItem() flattens a recurring Price
  // into price_data so a leftover monthly ID still charges once.
  tier_career_accelerator: "STRIPE_PRICE_ACCELERATOR_ONETIME",
  credit_pack_a: "STRIPE_PRICE_CREDIT_PACK_A",
  credit_pack_b: "STRIPE_PRICE_CREDIT_PACK_B",
  coaching_session: "STRIPE_PRICE_COACHING",
};

function envPriceId(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getOneTimePriceId(product: OneTimeProduct): string {
  let priceId = envPriceId(ONE_TIME_PRICE_ENV[product]);
  // Common misconfig: Accelerator one-time var never set, only the legacy
  // monthly price ID exists. Checkout still works because a recurring Price
  // is expanded to a one-time line item below.
  if (!priceId && product === "tier_career_accelerator") {
    priceId = envPriceId("STRIPE_PRICE_ACCELERATOR_MONTHLY");
  }
  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID for ${product}. Set ${ONE_TIME_PRICE_ENV[product]} in the environment and redeploy.`,
    );
  }
  return priceId;
}

export function productForPrice(priceId: string): OneTimeProduct | null {
  for (const product of Object.keys(ONE_TIME_PRICE_ENV) as OneTimeProduct[]) {
    if (envPriceId(ONE_TIME_PRICE_ENV[product]) === priceId) return product;
  }
  if (envPriceId("STRIPE_PRICE_ACCELERATOR_MONTHLY") === priceId) {
    return "tier_career_accelerator";
  }
  return null;
}

// Stripe rejects mode: "payment" when `price` is a recurring Price. The €99
// Accelerator plan used to be a subscription, so dashboards often still
// point at that monthly Price ID. Expand it to a one-time amount so checkout
// matches the current "pay once" product.
export async function oneTimeCheckoutLineItem(
  product: OneTimeProduct,
  quantity: number,
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  const priceId = getOneTimePriceId(product);
  const price = await getStripe().prices.retrieve(priceId);

  if (price.recurring) {
    if (typeof price.unit_amount !== "number") {
      throw new Error(
        `Stripe price ${priceId} is recurring but has no fixed amount. Create a one-time Price and set ${ONE_TIME_PRICE_ENV[product]}.`,
      );
    }
    const stripeProductId =
      typeof price.product === "string" ? price.product : price.product.id;
    return {
      quantity,
      price_data: {
        currency: price.currency,
        unit_amount: price.unit_amount,
        product: stripeProductId,
      },
    };
  }

  return { price: priceId, quantity };
}

// Legacy-only: only relevant for a real Stripe Subscription created before
// Career Accelerator switched to a one-time purchase. New purchases go
// through tier_career_accelerator above instead.
export function getAcceleratorPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY;
  if (!priceId) {
    throw new Error("Missing STRIPE_PRICE_ACCELERATOR_MONTHLY. Set it in .env.local.");
  }
  return priceId;
}

export function isAcceleratorPrice(priceId: string): boolean {
  return priceId === process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY;
}
