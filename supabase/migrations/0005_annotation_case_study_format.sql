-- Run this in the Supabase Dashboard SQL Editor after 0001-0004.
--
-- Replaces the free-form label-tag annotation format with the same
-- Mini Case Study shape used in lessons (scenario/question/options/
-- correct answer/explanation/reviewer notes) — the media (image pair,
-- video, or now audio) stands in for the lesson case study's
-- prompt+response text. Also drops the now-unused `rubric` column in
-- favor of `reviewer_notes`, matching Mini Case Study exactly.

alter table public.annotation_tasks
  drop constraint if exists annotation_tasks_type_check;

alter table public.annotation_tasks
  add constraint annotation_tasks_type_check check (type in ('image_pair', 'video', 'audio'));

alter table public.annotation_tasks
  drop column if exists label_options,
  drop column if exists rubric,
  add column if not exists scenario text,
  add column if not exists question text not null default '',
  add column if not exists options jsonb not null default '[]'::jsonb,
  add column if not exists correct_option_index integer not null default 0,
  add column if not exists explanation text,
  add column if not exists reviewer_notes text;
