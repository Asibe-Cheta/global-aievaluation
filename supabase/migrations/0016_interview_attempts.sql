-- Persists each completed AI Interview Simulator run so candidates can
-- review past reports and retake a previous role from where they left off.
create table public.interview_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id text not null,
  role_name text not null,
  score integer not null,
  competencies jsonb not null default '{}'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  growth_areas jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  transcript jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index interview_attempts_user_id_created_at_idx
  on public.interview_attempts (user_id, created_at desc);

alter table public.interview_attempts enable row level security;

create policy "interview_attempts_select_own" on public.interview_attempts
  for select using (user_id = auth.uid() or is_admin());

create policy "interview_attempts_insert_own" on public.interview_attempts
  for insert with check (user_id = auth.uid());
