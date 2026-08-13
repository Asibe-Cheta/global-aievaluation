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
// Starter/Professional — pay once, keep access), and both AI credit
// top-up packs.
export type OneTimeProduct =
  | "tier_starter"
  | "tier_professional_founding"
  | "tier_professional_regular"
  | "tier_career_accelerator"
  | "credit_pack_a"
  | "credit_pack_b";

const ONE_TIME_PRICE_IDS: Record<OneTimeProduct, string | undefined> = {
  tier_starter: process.env.STRIPE_PRICE_STARTER,
  tier_professional_founding: process.env.STRIPE_PRICE_PROFESSIONAL_FOUNDING,
  tier_professional_regular: process.env.STRIPE_PRICE_PROFESSIONAL_REGULAR,
  // Reuses STRIPE_PRICE_ACCELERATOR_MONTHLY — that var now holds the
  // one-time price id, not a recurring one (see getAcceleratorPriceId below,
  // kept only for any legacy real subscribers from before this change).
  tier_career_accelerator: process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY,
  credit_pack_a: process.env.STRIPE_PRICE_CREDIT_PACK_A,
  credit_pack_b: process.env.STRIPE_PRICE_CREDIT_PACK_B,
};

export function getOneTimePriceId(product: OneTimeProduct): string {
  const priceId = ONE_TIME_PRICE_IDS[product];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID for ${product}. Set it in .env.local.`);
  }
  return priceId;
}

export function productForPrice(priceId: string): OneTimeProduct | null {
  for (const product of Object.keys(ONE_TIME_PRICE_IDS) as OneTimeProduct[]) {
    if (ONE_TIME_PRICE_IDS[product] === priceId) return product;
  }
  return null;
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
