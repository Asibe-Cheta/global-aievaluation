// Single source of truth for tier/pricing copy — imported by MembershipView
// and every scattered upgrade CTA so they can't drift out of sync with each
// other or with the actual Stripe products.

export type TierId = "free" | "starter" | "professional" | "career_accelerator";

export interface TierMeta {
  id: TierId;
  label: string; // short badge/nav text, e.g. "Starter"
  displayName: string; // marketing name, e.g. "Independent Learner"
  priceDisplay: string; // e.g. "€20 one-time"
  billing: "free" | "one_time" | "subscription";
  features: string[];
}

export const TIERS: Record<TierId, TierMeta> = {
  free: {
    id: "free",
    label: "Free",
    displayName: "Free",
    priceDisplay: "€0",
    billing: "free",
    features: [
      "Module 1: what AI evaluation is and why it matters",
      "Curated job board — open to everyone, no signup required",
    ],
  },
  starter: {
    id: "starter",
    label: "Starter",
    displayName: "Independent Learner",
    priceDisplay: "€20 one-time",
    billing: "one_time",
    features: [
      "Full access to the AI Evaluation Academy",
      "Curated job board access",
      "Unlimited practice exercises",
      "AI Interview Simulator — 10 sessions included",
      "Progress tracking",
      "Updated lessons and assessment tips at no extra cost",
    ],
  },
  professional: {
    id: "professional",
    label: "Professional",
    displayName: "Job Ready Simulator",
    priceDisplay: "€52 one-time",
    billing: "one_time",
    features: [
      "Everything in Starter, plus:",
      "Full task-simulation bank (real-platform-style tasking exercises)",
      "AI Interview Simulator — 30 sessions/month, resets monthly",
      "Platform-specific interview simulations",
      "Adaptive, scenario-based interview questions",
      "AI Interview Report + Interview Readiness Score",
    ],
  },
  career_accelerator: {
    id: "career_accelerator",
    label: "Accelerator",
    displayName: "Stay Employed",
    priceDisplay: "€70/month",
    billing: "subscription",
    features: [
      "Everything in Professional, plus:",
      "Private community access",
      "Biweekly live Q&A / troubleshooting calls",
      "AI Interview Simulator — 50 sessions/month, resets monthly",
      "Ongoing curated job listings",
      "Quality-score troubleshooting support",
      "AI-powered CV & LinkedIn feedback, reviewed live",
      "Access to other expert AI evaluators",
    ],
  },
};

export const TIER_ORDER: TierId[] = ["free", "starter", "professional", "career_accelerator"];

export const PROFESSIONAL_FOUNDING_PRICE_DISPLAY = "€34";
export const PROFESSIONAL_FOUNDING_LIMIT = 150;

export interface CreditPack {
  id: "credit_pack_a" | "credit_pack_b";
  priceDisplay: string;
  sessions: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "credit_pack_a", priceDisplay: "€5", sessions: 15 },
  { id: "credit_pack_b", priceDisplay: "€10", sessions: 35 },
];
