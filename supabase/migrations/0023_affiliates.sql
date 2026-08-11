-- Self-serve affiliate program: any user can become an affiliate, gets a
-- referral code/link, and earns a commission on the first payment of any
-- sale attributed to them. Payouts happen manually (bank transfer/PayPal)
-- outside the app — these tables exist purely for tracking and an admin
-- ledger to mark commissions paid.

create table public.affiliates (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  code text not null unique,
  commission_rate numeric not null default 0.20,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);

alter table public.affiliates enable row level security;

create policy "affiliates_select_own" on public.affiliates
  for select using (user_id = auth.uid() or is_admin());
create policy "affiliates_insert_own" on public.affiliates
  for insert with check (user_id = auth.uid());
create policy "affiliates_admin_update" on public.affiliates
  for update using (is_admin()) with check (is_admin());

-- One row per attributed sale. stripe_checkout_session_id is the webhook
-- idempotency guard, same pattern as public.purchases.
create table public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  stripe_checkout_session_id text not null unique,
  product_type text,
  sale_amount_cents integer not null,
  commission_cents integer not null,
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create index affiliate_referrals_affiliate_user_id_idx on public.affiliate_referrals (affiliate_user_id);

alter table public.affiliate_referrals enable row level security;

create policy "affiliate_referrals_select_own" on public.affiliate_referrals
  for select using (affiliate_user_id = auth.uid() or is_admin());
create policy "affiliate_referrals_admin_update" on public.affiliate_referrals
  for update using (is_admin()) with check (is_admin());
-- No insert policy for authenticated users — only the webhook (service_role,
-- bypasses RLS) writes rows here.
