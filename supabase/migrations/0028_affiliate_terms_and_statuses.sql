-- Aligns the affiliate schema with the official Affiliate Program Terms:
-- standard commission is 30% (was defaulting new affiliates to 20%), and
-- joining requires recording acceptance of a specific terms version.
-- Referral status also gains the full lifecycle the terms describe
-- (Pending -> Approved -> Paid, or Reversed/Cancelled if a sale is voided)
-- instead of just pending/paid.

alter table public.affiliates
  alter column commission_rate set default 0.30;

alter table public.affiliates
  add column terms_accepted_at timestamptz,
  add column terms_version text;

alter table public.affiliate_referrals
  drop constraint if exists affiliate_referrals_status_check;
alter table public.affiliate_referrals
  add constraint affiliate_referrals_status_check
  check (status in ('pending', 'approved', 'paid', 'reversed', 'cancelled'));
