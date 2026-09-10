-- Grant comped ("free") access to paid products without going through
-- Stripe checkout — e.g. giving a cohort the Career Accelerator, or
-- comping the 1-to-1 Coaching add-on.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- ============================ IMPORTANT ============================
-- This repository is PUBLIC. Do NOT commit real customer email
-- addresses into this file. Paste them into v_emails locally, run it,
-- then revert the array before committing. Anything committed here is
-- permanent — it survives in git history even if deleted later.
-- ===================================================================
--
-- Idempotent: safe to re-run as more people sign up. Each grant uses a
-- deterministic synthetic checkout session id ('manual_grant_<product>_<uuid>'),
-- so re-running skips anyone already granted via the unique constraint on
-- purchases.stripe_checkout_session_id. Users with no auth.users row yet are
-- skipped and listed in the NO ACCOUNT FOUND notice — re-run once they sign up.
--
-- amount_cents = 0 deliberately: no money moved through Stripe, and this
-- ledger feeds Stripe reconciliation (see 0026_coaching_offer.sql). Set a
-- real amount only if you want these counted as revenue.
--
-- Note: 'coaching_session' is intentionally NOT a tier — it never changes
-- membership_tier (see 0026_coaching_offer.sql). Granting it records the
-- entitlement; the session itself is arranged manually.

do $$
declare
  -- Fill these in locally. Revert to the placeholder before committing.
  v_emails text[] := array[
    'person@example.com'
  ];
  -- Subset of v_emails that also gets the coaching add-on. '{}' for none.
  v_coaching_emails text[] := '{}';

  v_email   text;
  v_user_id uuid;
  v_missing text[] := '{}';
  v_granted int := 0;
begin
  foreach v_email in array v_emails loop
    select id into v_user_id
    from auth.users
    where lower(email) = lower(v_email);

    if v_user_id is null then
      v_missing := v_missing || v_email;
      continue;
    end if;

    insert into public.purchases (
      user_id, stripe_checkout_session_id, product_type,
      amount_cents, currency, status
    )
    values (
      v_user_id, 'manual_grant_accelerator_' || v_user_id,
      'tier_career_accelerator', 0, 'eur', 'completed'
    )
    on conflict (stripe_checkout_session_id) do nothing;

    if lower(v_email) = any (select lower(unnest(v_coaching_emails))) then
      insert into public.purchases (
        user_id, stripe_checkout_session_id, product_type,
        amount_cents, currency, status
      )
      values (
        v_user_id, 'manual_grant_coaching_' || v_user_id,
        'coaching_session', 0, 'eur', 'completed'
      )
      on conflict (stripe_checkout_session_id) do nothing;
    end if;

    -- Mirror recomputeMembershipTier() in lib/stripe/sync.ts: the tier and
    -- the monthly interview-credit allotment both follow from ownership.
    update public.profiles
       set membership_tier = 'career_accelerator'
     where id = v_user_id;

    insert into public.interview_credits (user_id, monthly_allotment)
    values (v_user_id, 50)
    on conflict (user_id) do update
      set monthly_allotment = 50,
          updated_at = now();

    v_granted := v_granted + 1;
  end loop;

  raise notice 'Granted to % user(s).', v_granted;
  if array_length(v_missing, 1) is not null then
    raise notice 'NO ACCOUNT FOUND for: %', array_to_string(v_missing, ', ');
  end if;
end $$;


-- ============ verification ============
-- Reports on every comped grant, found via the 'manual_grant_%' prefix, so
-- there is no email list to keep in sync (and none to leak into git).
--
--   OK         - tier applied and the purchase row exists
--   INCOMPLETE - purchase row exists but membership_tier didn't stick
--                (check the protect_privileged_profile_columns trigger,
--                 supabase/migrations/0003_protect_membership_tier.sql)
--
-- Anyone you tried to grant who never appears here has no account yet:
-- they were skipped, and the NO ACCOUNT FOUND notice above names them.
select
  u.email,
  case
    when p.membership_tier = 'career_accelerator' then 'OK'
    else 'INCOMPLETE'
  end                                as status,
  p.membership_tier,
  ic.monthly_allotment,
  string_agg(pu.product_type, ', ' order by pu.product_type) as comped,
  min(pu.created_at)                 as granted_at
from public.purchases pu
join auth.users u                      on u.id = pu.user_id
left join public.profiles p            on p.id = pu.user_id
left join public.interview_credits ic  on ic.user_id = pu.user_id
where pu.stripe_checkout_session_id like 'manual_grant_%'
  and pu.status = 'completed'
group by u.email, p.membership_tier, ic.monthly_allotment
order by status, u.email;
