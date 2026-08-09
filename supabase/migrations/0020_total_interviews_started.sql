-- consume_interview_credit() already no-ops safely at zero balance (falls
-- through all three spend attempts, returns the row unchanged) — so it's
-- always safe to call. But it has no lifetime counter, so calling it alone
-- doesn't satisfy "every interview session gets counted" while balances
-- are mostly zero (e.g. during the TEMP_DISABLE_ALL_PAYMENT_GATES testing
-- period, where nothing's actually been purchased). Add a genuine counter.
alter table public.user_progress
  add column total_interviews_started integer not null default 0;

create or replace function public.increment_interview_sessions_started(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.user_progress
    set total_interviews_started = total_interviews_started + 1
    where user_id = p_user_id;
$$;
