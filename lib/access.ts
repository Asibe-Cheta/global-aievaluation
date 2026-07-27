import type { UserStats } from "@/types";

export type MembershipTier = UserStats["membershipTier"];

// TEMP: all modules/lessons unlocked for everyone so content can be
// reviewed as it's built in admin. Flip back to false to restore the
// starter-tier "Module 1 only" gate.
const TEMP_UNLOCK_ALL_MODULES = true;

export function isPaidTier(tier: MembershipTier): boolean {
  return tier === "professional" || tier === "career_accelerator";
}

/**
 * Free (starter) accounts only get the first module in the curriculum as a
 * preview; everything else requires a paid plan. `index` is the module's
 * 0-based position in the curriculum's sort order.
 */
export function isModuleAccessible(tier: MembershipTier, index: number): boolean {
  if (TEMP_UNLOCK_ALL_MODULES) return true;
  if (isPaidTier(tier)) return true;
  return index === 0;
}
