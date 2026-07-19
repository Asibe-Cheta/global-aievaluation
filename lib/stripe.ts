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

export type PaidTier = "professional" | "career_accelerator";
export type BillingPeriod = "monthly" | "annually";

const PRICE_IDS: Record<PaidTier, Record<BillingPeriod, string | undefined>> = {
  professional: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    annually: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
  },
  career_accelerator: {
    monthly: process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY,
    annually: process.env.STRIPE_PRICE_ACCELERATOR_ANNUAL,
  },
};

export function getPriceId(tier: PaidTier, billingPeriod: BillingPeriod): string {
  const priceId = PRICE_IDS[tier][billingPeriod];
  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID for ${tier}/${billingPeriod}. Set it in .env.local.`,
    );
  }
  return priceId;
}

export function tierAndPeriodForPrice(
  priceId: string,
): { tier: PaidTier; billingPeriod: BillingPeriod } | null {
  for (const tier of Object.keys(PRICE_IDS) as PaidTier[]) {
    for (const billingPeriod of Object.keys(PRICE_IDS[tier]) as BillingPeriod[]) {
      if (PRICE_IDS[tier][billingPeriod] === priceId) {
        return { tier, billingPeriod };
      }
    }
  }
  return null;
}
