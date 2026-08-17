-- 1-to-1 Coaching: a one-off paid add-on (€120, external session booked
-- manually — see lib/pricing.ts COACHING_OFFER), not a membership tier. It
-- rides the same `purchases` ledger as everything else so it shows up in
-- Stripe reconciliation and the admin can see who's paid, but its
-- "coaching_session" product_type is deliberately not "tier_..." so
-- recomputeMembershipTier (app/api/stripe/webhook/route.ts) never touches
-- membership_tier for it.
alter table public.purchases drop constraint if exists purchases_product_type_check;
alter table public.purchases add constraint purchases_product_type_check
  check (product_type in (
    'tier_starter',
    'tier_professional_founding',
    'tier_professional_regular',
    'tier_career_accelerator',
    'credit_pack_a',
    'credit_pack_b',
    'coaching_session'
  ));
