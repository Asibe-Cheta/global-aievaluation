-- Unified "Practice Task" schema — replaces exam_questions and
-- annotation_tasks with one table. A practice task is a judge-the-response
-- exercise: the candidate reads a guideline/rubric, an item to evaluate,
-- one or two responses, and a question, then answers via a multiple-choice
-- pick, a written rationale, or both. Every content block carries its own
-- optional media (image/video/audio) rather than media being a bolted-on
-- extra field, since on annotation-style tasks the media IS the content.
create table public.practice_tasks (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,

  -- Identity (admin-only, not shown to the candidate)
  task_type text not null default 'evaluation',
  category text,
  sort_order integer not null default 0,

  -- The task — each block is {text: string, media: [{type,path,url,durationSeconds?}]}
  guideline jsonb not null default '{"text":"","media":[]}'::jsonb,
  item jsonb not null default '{"text":"","media":[]}'::jsonb,
  response_a jsonb not null default '{"text":"","media":[]}'::jsonb,
  response_b jsonb, -- null unless this is a pairwise-comparison task
  question text not null default '',

  -- Response mode: what the candidate answers with
  response_mode text not null default 'choice'
    check (response_mode in ('choice', 'written', 'choice_plus_written')),
  -- judge = read and give a verdict (everything built today). produce =
  -- reserved for a later phase (draw a box, select a span, write a full
  -- response against a live reference) — not exposed in the admin form yet.
  interaction_type text not null default 'judge'
    check (interaction_type in ('judge', 'produce')),

  -- Options — only meaningful when response_mode is choice or choice_plus_written
  options jsonb not null default '[]'::jsonb, -- [{text, is_correct}], 2-6 items, exactly one is_correct

  -- Revealed after submit
  model_answer text,
  explanation text,
  reviewer_notes text,

  -- Config
  timed boolean not null default false,
  time_limit_seconds integer,
  failure_mode_tags text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index practice_tasks_module_id_idx on public.practice_tasks (module_id, sort_order);

alter table public.practice_tasks enable row level security;

create policy "practice_tasks_select_all" on public.practice_tasks
  for select using (true);
create policy "practice_tasks_admin_write" on public.practice_tasks
  for all using (is_admin()) with check (is_admin());

-- Per-user submissions, parallel to the existing annotation_submissions /
-- exam_scores columns this table's data is migrated from.
alter table public.user_progress
  add column practice_task_submissions jsonb not null default '{}'::jsonb;
