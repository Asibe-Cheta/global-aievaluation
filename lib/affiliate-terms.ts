// Bump this whenever the Affiliate Program Terms (app/affiliate-terms/page.tsx)
// materially change — becomeAffiliate() stamps whichever version was current
// at acceptance, so there's a durable record of what each affiliate agreed to.
//
// Kept out of lib/actions/affiliates.ts because a "use server" file may only
// export async functions — a plain const value export breaks the build.
export const AFFILIATE_TERMS_VERSION = "2026-09-01";
