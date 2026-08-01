-- Run this in the Supabase Dashboard SQL Editor after 0001-0012.
--
-- The Stripe webhook grants credits (Starter's one-time 10 sessions, or a
-- credit-pack top-up) by incrementing a balance. A plain
-- read-current-value-then-write-value+delta from the webhook handler would
-- race if Stripe ever redelivers/parallelizes events for the same user.
-- This does the increment atomically in a single UPDATE, same reasoning as
-- consume_interview_credit() in 0012.
create or replace function public.grant_interview_credits(
  p_user_id uuid,
  p_one_time integer default 0,
  p_topup integer default 0
)
returns public.interview_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.interview_credits;
begin
  update public.interview_credits
    set one_time_balance = one_time_balance + p_one_time,
        topup_balance = topup_balance + p_topup,
        updated_at = now()
    where user_id = p_user_id
    returning * into r;
  return r;
end;
$$;
