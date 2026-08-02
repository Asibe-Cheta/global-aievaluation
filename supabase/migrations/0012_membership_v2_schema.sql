-- Run this in the Supabase Dashboard SQL Editor after 0001-0011.
--
-- Replaces the 3-tier subscription-only membership model with the new
-- 4-tier model: free / starter  (one-time) / professional (one-time,
-- founding-or-regular price) / career_accelerator (the only recurring
-- subscription). See the "Replace pricing/membership model" plan for full
-- context.

-- Every statement below is written to be safely re-runnable (this file
-- previously failed partway through on a re-run — "relation already
-- exists" — because plain `create table`/`create policy` aren't
-- idempotent; `if not exists` / `drop ... if exists` first fixes that).

-- ============ profiles.membership_tier: add 'free', default to it ============
alter table public.profiles drop constraint if exists profiles_membership_tier_check;
alter table public.profiles add constraint profiles_membership_tier_check
  check (membership_tier in ('free', 'starter', 'professional', 'career_accelerator'));
alter table public.profiles alter column membership_tier set default 'free';

-- ============ stripe_customers ============
-- Every tier (one-time or recurring) needs a Stripe customer id. Previously
-- this was looked up via the `subscriptions` table, which only makes sense
-- for a recurring subscriber. `subscriptions` now exists purely to track
-- career_accelerator's recurring state.
create table if not exists public.stripe_customers (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

alter table public.stripe_customers enable row level security;
drop policy if exists "stripe_customers_select_own" on public.stripe_customers;
create policy "stripe_customers_select_own" on public.stripe_customers
  for select using (user_id = auth.uid() or is_admin());
-- No insert/update policy for authenticated users — only service_role
-- (server actions / the Stripe webhook) may write this table.

-- ============ purchases ============
-- One-time payment ledger: Starter, Professional (founding or regular
-- price), and both AI credit top-up packs. The unique checkout-session-id
-- constraint is the webhook idempotency guard (Stripe retries webhooks).
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  product_type text not null check (product_type in (
    'tier_starter',
    'tier_professional_founding',
    'tier_professional_regular',
    'credit_pack_a',
    'credit_pack_b'
  )),
  amount_cents integer,
  currency text not null default 'eur',
  status text not null default 'completed' check (status in ('completed', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;
drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (user_id = auth.uid() or is_admin());
-- No write policy for authenticated users — only service_role writes.

-- ============ interview_credits ============
-- One row per user. Three independent buckets, spent in this order when a
-- session starts: monthly_allotment (use-it-or-lose-it, resets every
-- calendar month) -> topup_balance (credit packs, never expires) ->
-- one_time_balance (Starter's 10-session grant, never expires, never
-- resets). monthly_allotment reflects whichever paid tier is currently
-- *effective* (30 for professional, 50 while career_accelerator is active;
-- drops back to 30 automatically once accelerator lapses since professional
-- ownership persists).
create table if not exists public.interview_credits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  one_time_balance integer not null default 0,
  monthly_allotment integer not null default 0,
  monthly_used integer not null default 0,
  monthly_cycle_anchor date,
  topup_balance integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.interview_credits enable row level security;
drop policy if exists "interview_credits_select_own" on public.interview_credits;
create policy "interview_credits_select_own" on public.interview_credits
  for select using (user_id = auth.uid() or is_admin());
-- No insert/update policy for authenticated users — only service_role
-- writes, and consume_interview_credit() below (security definer) is the
-- only way a logged-in user's action can decrement a balance.

-- Give every existing profile a credits row (new signups get one via the
-- updated handle_new_user() trigger below).
insert into public.interview_credits (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- ============ new-user trigger: also create an interview_credits row ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, split_part(new.email, '@', 1));
  insert into public.user_progress (user_id) values (new.id);
  insert into public.interview_credits (user_id) values (new.id);
  return new;
end;
$$;

-- ============ consume_interview_credit(): atomic spend + lazy monthly reset ============
-- Postgres function because supabase-js can't express a column-to-column
-- WHERE comparison (monthly_used < monthly_allotment) directly, and because
-- this needs to be atomic under concurrent calls for the same user.
create or replace function public.consume_interview_credit(p_user_id uuid)
returns public.interview_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.interview_credits;
begin
  -- Lazy monthly reset: if the stored cycle anchor isn't the current
  -- calendar month, the monthly allotment has "renewed" — zero out usage.
  update public.interview_credits
    set monthly_used = 0,
        monthly_cycle_anchor = date_trunc('month', now())::date
    where user_id = p_user_id
      and (monthly_cycle_anchor is null or monthly_cycle_anchor < date_trunc('month', now())::date);

  -- Try the monthly allotment first (use-it-or-lose-it).
  update public.interview_credits
    set monthly_used = monthly_used + 1, updated_at = now()
    where user_id = p_user_id and monthly_used < monthly_allotment
    returning * into r;
  if found then return r; end if;

  -- Then top-up credit packs.
  update public.interview_credits
    set topup_balance = topup_balance - 1, updated_at = now()
    where user_id = p_user_id and topup_balance > 0
    returning * into r;
  if found then return r; end if;

  -- Then the one-time grant (Starter's 10 sessions).
  update public.interview_credits
    set one_time_balance = one_time_balance - 1, updated_at = now()
    where user_id = p_user_id and one_time_balance > 0
    returning * into r;
  if found then return r; end if;

  -- Nothing to spend — return current state unchanged so the caller can
  -- tell the difference (compare balances before/after, or just check this
  -- didn't decrement anything).
  select * into r from public.interview_credits where user_id = p_user_id;
  return r;
end;
$$;
