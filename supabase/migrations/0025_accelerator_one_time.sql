-- Career Accelerator switched from a recurring monthly subscription to a
-- one-time purchase (€70, 2-week program) — same ownership model as Starter
-- and Professional. Existing real subscribers (if any) are unaffected;
-- their tier keeps resolving from public.subscriptions.status as before.
alter table public.purchases drop constraint if exists purchases_product_type_check;
alter table public.purchases add constraint purchases_product_type_check
  check (product_type in (
    'tier_starter',
    'tier_professional_founding',
    'tier_professional_regular',
    'tier_career_accelerator',
    'credit_pack_a',
    'credit_pack_b'
  ));
