-- Run this in the Supabase Dashboard SQL Editor after 0001-0013.
--
-- Postgres grants EXECUTE on newly created functions to PUBLIC by default,
-- and both credit-mutating RPCs from 0012/0013 are SECURITY DEFINER, so
-- without this migration any signed-in user could call them directly from
-- the browser client:
--   - consume_interview_credit(p_user_id) took an arbitrary target uuid, so
--     any user could drain another user's balance.
--   - grant_interview_credits(p_user_id, ...) took an arbitrary target uuid
--     and delta, so any user could mint themselves free credits.
-- Same class of bug 0003_protect_membership_tier.sql already guards against
-- for profiles.membership_tier/is_admin.

-- grant_interview_credits is only ever called by the Stripe webhook (which
-- runs as service_role, and Supabase grants service_role blanket function
-- access independent of these PUBLIC grants) — no authenticated user should
-- be able to call it at all.
revoke execute on function public.grant_interview_credits(uuid, integer, integer) from public, anon, authenticated;

-- Redefine consume_interview_credit to always operate on the caller's own
-- auth.uid() instead of a caller-supplied user id, so it's safe to leave
-- callable by 'authenticated' (that's the intended use: the signed-in user
-- spending their own credit when they start an interview session).
drop function if exists public.consume_interview_credit(uuid);

create or replace function public.consume_interview_credit()
returns public.interview_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.interview_credits;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.interview_credits
    set monthly_used = 0,
        monthly_cycle_anchor = date_trunc('month', now())::date
    where user_id = v_user_id
      and (monthly_cycle_anchor is null or monthly_cycle_anchor < date_trunc('month', now())::date);

  update public.interview_credits
    set monthly_used = monthly_used + 1, updated_at = now()
    where user_id = v_user_id and monthly_used < monthly_allotment
    returning * into r;
  if found then return r; end if;

  update public.interview_credits
    set topup_balance = topup_balance - 1, updated_at = now()
    where user_id = v_user_id and topup_balance > 0
    returning * into r;
  if found then return r; end if;

  update public.interview_credits
    set one_time_balance = one_time_balance - 1, updated_at = now()
    where user_id = v_user_id and one_time_balance > 0
    returning * into r;
  if found then return r; end if;

  select * into r from public.interview_credits where user_id = v_user_id;
  return r;
end;
$$;

-- Read-only companion so the UI can show/gate on the spendable balance
-- without mutating anything. Applies the same lazy-monthly-reset logic as
-- consume_interview_credit() on the fly, scoped to the caller only.
create or replace function public.get_interview_credit_balance()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    greatest(
      monthly_allotment - case
        when monthly_cycle_anchor is null or monthly_cycle_anchor < date_trunc('month', now())::date then 0
        else monthly_used
      end,
      0
    ) + topup_balance + one_time_balance,
    0
  )
  from public.interview_credits
  where user_id = auth.uid();
$$;
