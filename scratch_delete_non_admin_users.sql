-- Deletes every user EXCEPT those with admin access. Run in the Supabase
-- SQL Editor. `profiles.id references auth.users(id) on delete cascade`,
-- and every other user-owned table (user_progress, interview_credits,
-- purchases, subscriptions, interview_attempts, stripe_customers,
-- affiliates, etc.) references profiles(id) on delete cascade too — so
-- deleting from auth.users alone removes everything belonging to that
-- user across the whole schema. This is IRREVERSIBLE. Back up first
-- (Supabase Dashboard -> Database -> Backups, or pg_dump) and run the
-- preview SELECT below before running the DELETE.

-- 1) PREVIEW — see exactly who would be deleted before committing to it.
select u.id, u.email, p.display_name, p.membership_tier, p.is_admin
from auth.users u
join public.profiles p on p.id = u.id
where p.is_admin is not true
order by u.created_at;

-- 2) THE ACTUAL DELETE — only run this after reviewing the preview above
-- and confirming it's exactly who you expect to remove.
delete from auth.users
where id in (
  select id from public.profiles where is_admin is not true
);
