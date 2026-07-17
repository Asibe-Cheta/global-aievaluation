-- Global Ready AIEval — initial schema
-- Run this in the Supabase Dashboard SQL Editor (Project -> SQL Editor -> New query).

-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  job_role text,
  location text,
  timezone text,
  avatar_url text,
  membership_tier text not null default 'starter'
    check (membership_tier in ('starter','professional','career_accelerator')),
  is_admin boolean not null default false,
  settings jsonb not null default '{"notificationsEnabled":true,"audioFeedback":true,"pacingMode":"standard"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ user_progress ============
create table public.user_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp integer not null default 0,
  active_rank text not null default 'Trainee Evaluator',
  streak_count integer not null default 0,
  last_active_date date,
  skills jsonb not null default '{"promptEvaluation":0,"responseRanking":0,"factChecking":0,"safetyReview":0,"annotation":0,"reasoning":0,"reasoningEvaluation":0,"instructionFollowing":0}'::jsonb,
  completed_lessons text[] not null default '{}',
  completed_simulations text[] not null default '{}',
  passed_exams text[] not null default '{}',
  practice_submissions jsonb not null default '{}'::jsonb,
  quiz_scores jsonb not null default '{}'::jsonb,
  simulation_scores jsonb not null default '{}'::jsonb,
  exam_scores jsonb not null default '{}'::jsonb,
  current_module_id text,
  current_lesson_id text,
  updated_at timestamptz not null default now()
);

-- ============ modules ============
create table public.modules (
  id text primary key,
  title text not null,
  description text,
  simulation_intro jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ lessons ============
create table public.lessons (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  duration text,
  objectives jsonb not null default '[]'::jsonb,
  content jsonb not null default '[]'::jsonb,
  examples jsonb not null default '[]'::jsonb,
  mini_case_studies jsonb not null default '[]'::jsonb,
  reflection_questions jsonb not null default '[]'::jsonb,
  key_takeaways jsonb not null default '[]'::jsonb,
  practice_lab jsonb not null default '[]'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ simulation_tasks ============
create table public.simulation_tasks (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  type text,
  title text,
  prompt text,
  responses jsonb,
  response_single text,
  response text,
  options jsonb not null default '[]'::jsonb,
  correct_option_index integer,
  ideal_justification_keywords jsonb not null default '[]'::jsonb,
  rubric text,
  explanation text,
  ideal_rating integer,
  ideal_flags jsonb,
  category text,
  sort_order integer not null default 0
);

-- ============ exam_questions ============
create table public.exam_questions (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  type text,
  category text,
  question text,
  options jsonb not null default '[]'::jsonb,
  correct_option_index integer,
  explanation text,
  part text,
  scenario text,
  sort_order integer not null default 0
);

-- ============ achievements ============
create table public.achievements (
  id text primary key,
  title text not null,
  description text,
  icon text,
  req_metric text,
  sort_order integer not null default 0
);

-- ============ jobs ============
create table public.jobs (
  id text primary key,
  title text not null,
  pay_rate text,
  pay_rate_min_cents integer,
  referral_reward text,
  badge text,
  hired_text text,
  category text check (category in ('project-based','one-time','talent-network')),
  field text,
  avatars jsonb not null default '[]'::jsonb,
  required_lesson_id text,
  required_lesson_name text,
  description text,
  skills_needed jsonb not null default '[]'::jsonb,
  application_url text not null default 'https://outlier.ai/?ref=academy',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ subscriptions (Stripe-linked; wired up in a later phase) ============
create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text check (tier in ('starter','professional','career_accelerator')),
  billing_period text check (billing_period in ('monthly','annually')),
  status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ helper: is_admin() ============
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;

-- ============ new-user trigger: create profile + progress row ============
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.simulation_tasks enable row level security;
alter table public.exam_questions enable row level security;
alter table public.achievements enable row level security;
alter table public.jobs enable row level security;
alter table public.subscriptions enable row level security;

-- profiles: own row read/update; admins read/update all
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or is_admin());

-- user_progress: own row read/update; admins read all (for admin user list)
create policy "progress_select_own" on public.user_progress for select using (user_id = auth.uid() or is_admin());
create policy "progress_update_own" on public.user_progress for update using (user_id = auth.uid() or is_admin());
create policy "progress_insert_own" on public.user_progress for insert with check (user_id = auth.uid());

-- content tables: public read, admin-only write
create policy "modules_select_all" on public.modules for select using (true);
create policy "modules_admin_write" on public.modules for all using (is_admin()) with check (is_admin());

create policy "lessons_select_all" on public.lessons for select using (true);
create policy "lessons_admin_write" on public.lessons for all using (is_admin()) with check (is_admin());

create policy "sim_tasks_select_all" on public.simulation_tasks for select using (true);
create policy "sim_tasks_admin_write" on public.simulation_tasks for all using (is_admin()) with check (is_admin());

create policy "exam_q_select_all" on public.exam_questions for select using (true);
create policy "exam_q_admin_write" on public.exam_questions for all using (is_admin()) with check (is_admin());

create policy "achievements_select_all" on public.achievements for select using (true);
create policy "achievements_admin_write" on public.achievements for all using (is_admin()) with check (is_admin());

-- jobs: public read of active jobs, admins see/manage everything
create policy "jobs_select_active" on public.jobs for select using (is_active or is_admin());
create policy "jobs_admin_write" on public.jobs for all using (is_admin()) with check (is_admin());

-- subscriptions: user reads own row; only service_role (server, via Stripe webhook) writes
create policy "subscriptions_select_own" on public.subscriptions for select using (user_id = auth.uid() or is_admin());

-- ============ storage: avatars bucket ============
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "avatar_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar_owner_write" on storage.objects for insert with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "avatar_owner_update" on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
