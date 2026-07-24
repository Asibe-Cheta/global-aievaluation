import type { UserStats } from "@/types";

export type MembershipTier = UserStats["membershipTier"];

export function isPaidTier(tier: MembershipTier): boolean {
  return tier === "professional" || tier === "career_accelerator";
}

/**
 * Free (starter) accounts only get the first module in the curriculum as a
 * preview; everything else requires a paid plan. `index` is the module's
 * 0-based position in the curriculum's sort order.
 */
export function isModuleAccessible(tier: MembershipTier, index: number): boolean {
  if (isPaidTier(tier)) return true;
  return index === 0;
}
