-- Run this in the Supabase Dashboard SQL Editor after 0001_init.sql and
-- 0002_skill_boosts.sql.
--
-- profiles_update_own lets a user update their own row, but RLS can't
-- restrict which columns — without this, any authenticated user could set
-- their own membership_tier or is_admin via the Supabase client directly.
-- Only the Stripe webhook (service_role) or an admin may change these two
-- columns; everyone else's writes to them are silently reverted.
create or replace function public.protect_privileged_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() != 'service_role' and not public.is_admin() then
    new.membership_tier := old.membership_tier;
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger protect_privileged_profile_columns
  before update on public.profiles
  for each row execute function public.protect_privileged_profile_columns();
