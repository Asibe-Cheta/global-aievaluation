-- Run this in the Supabase Dashboard SQL Editor after 0001-0014.
--
-- One-off data fix: 0001_init.sql originally defaulted every new profile's
-- membership_tier to 'starter' (there wasn't even a 'free' tier yet), and
-- handle_new_user() only ever inserted (id, display_name), relying on that
-- column default. So every account created before 0012_membership_v2_schema
-- switched the default to 'free' still has the literal string 'starter'
-- sitting in profiles.membership_tier — with no purchase behind it. That's
-- why the membership page can show "Your Current Plan" / unlock paid
-- features for someone who never paid: it trusts profiles.membership_tier,
-- and that column itself is wrong, not the code reading it.
--
-- This recomputes membership_tier (and the interview_credits monthly
-- allotment that depends on it) for every existing profile from the actual
-- purchases/subscriptions ledger, using the exact same precedence as
-- recomputeMembershipTier() in app/api/stripe/webhook/route.ts: Accelerator
-- (active/trialing subscription) beats an owned Professional purchase beats
-- an owned Starter purchase beats 'free'. It only touches membership_tier
-- and monthly_allotment — never one_time_balance/topup_balance, since those
-- are earned/spent ledgers, not tier-derived state.

with effective_tier as (
  select
    p.id as user_id,
    case
      when s.status in ('active', 'trialing') then 'career_accelerator'
      when bool_or(pu.product_type in ('tier_professional_founding', 'tier_professional_regular')) then 'professional'
      when bool_or(pu.product_type = 'tier_starter') then 'starter'
      else 'free'
    end as tier
  from public.profiles p
  left join public.subscriptions s on s.user_id = p.id
  left join public.purchases pu on pu.user_id = p.id and pu.status = 'completed'
  group by p.id, s.status
)
update public.profiles p
set membership_tier = effective_tier.tier
from effective_tier
where p.id = effective_tier.user_id
  and p.membership_tier is distinct from effective_tier.tier;

with effective_tier as (
  select
    p.id as user_id,
    case
      when s.status in ('active', 'trialing') then 'career_accelerator'
      when bool_or(pu.product_type in ('tier_professional_founding', 'tier_professional_regular')) then 'professional'
      when bool_or(pu.product_type = 'tier_starter') then 'starter'
      else 'free'
    end as tier
  from public.profiles p
  left join public.subscriptions s on s.user_id = p.id
  left join public.purchases pu on pu.user_id = p.id and pu.status = 'completed'
  group by p.id, s.status
)
update public.interview_credits ic
set monthly_allotment = case effective_tier.tier
  when 'career_accelerator' then 50
  when 'professional' then 30
  else 0
end
from effective_tier
where ic.user_id = effective_tier.user_id
  and ic.monthly_allotment is distinct from (case effective_tier.tier
    when 'career_accelerator' then 50
    when 'professional' then 30
    else 0
  end);
