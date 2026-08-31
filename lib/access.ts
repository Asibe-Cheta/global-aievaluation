import type { UserStats } from "@/types";

export type MembershipTier = UserStats["membershipTier"];

// Every payment gate in the app is now enforced for real. This was `true`
// during content-building/testing — flipped back to `false` once the
// comp'd accounts (asibechetachukwu@gmail.com, junioraloysius4@gmail.com,
// chiatiibimi@gmail.com) were given permanent Career Accelerator access via
// a real `purchases` row, so real tier gating applies to everyone else.
// This is the single source of truth for the bypass — App.tsx's two direct
// membershipTier checks (lesson lock interception, interview simulator
// paywall) import and check it too, so there's exactly one flag to flip.
export const TEMP_DISABLE_ALL_PAYMENT_GATES = false;

// Any tier above the free preview tier — Starter, Professional, or Career
// Accelerator all count as "paid" (Starter is a one-time purchase, not a
// subscription, but it's still a paid tier).
export function isPaidTier(tier: MembershipTier): boolean {
  if (TEMP_DISABLE_ALL_PAYMENT_GATES) return true;
  return tier !== "free";
}

/**
 * Full Academy access (all lessons/modules) — everything from Starter up.
 * The free tier only gets Module 1 as a preview.
 */
export function hasAcademyAccess(tier: MembershipTier): boolean {
  if (TEMP_DISABLE_ALL_PAYMENT_GATES) return true;
  return tier !== "free";
}

/**
 * Free accounts only get the first module in the curriculum as a preview;
 * Starter and above unlock every module. `index` is the module's 0-based
 * position in the curriculum's sort order.
 */
export function isModuleAccessible(tier: MembershipTier, index: number): boolean {
  if (TEMP_DISABLE_ALL_PAYMENT_GATES) return true;
  if (hasAcademyAccess(tier)) return true;
  return index === 0;
}

/**
 * The full task-simulation bank (Simulation Tasks, Data Annotation, Exam
 * Practice) is a Professional+ feature — Starter only includes the lesson
 * content and (limited) interview simulator, not the practice bank.
 */
export function isSimulationPracticeAccessible(tier: MembershipTier): boolean {
  if (TEMP_DISABLE_ALL_PAYMENT_GATES) return true;
  return tier === "professional" || tier === "career_accelerator";
}
