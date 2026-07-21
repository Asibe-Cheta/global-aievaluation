-- Run this in the Supabase Dashboard SQL Editor after 0001-0003.
--
-- Data annotation practice tasks: an admin uploads either a pair of images
-- (image_pair) or a single short clip (video, enforced <=10s client-side on
-- upload) and users tag/label what they see. Media files live in the
-- annotation-media storage bucket; this table stores the task metadata and
-- pointers to those files.

create table public.annotation_tasks (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  type text not null check (type in ('image_pair', 'video')),
  title text not null,
  instructions text,
  -- image_pair: [{path, url}, {path, url}] (exactly 2)
  -- video: [{path, url, duration_seconds}] (exactly 1)
  media jsonb not null default '[]'::jsonb,
  -- tags/flags the user can pick while annotating, e.g. ["Blurry","Unsafe content","Off-topic"]
  label_options jsonb not null default '[]'::jsonb,
  rubric text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.annotation_tasks enable row level security;

create policy "annotation_tasks_select_all" on public.annotation_tasks for select using (true);
create policy "annotation_tasks_admin_write" on public.annotation_tasks for all using (is_admin()) with check (is_admin());

-- Per-user submissions (labels picked + notes), parallel to quiz_scores /
-- simulation_scores / exam_scores already on this table.
alter table public.user_progress
  add column annotation_submissions jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public)
  values ('annotation-media', 'annotation-media', true)
  on conflict (id) do nothing;

create policy "annotation_media_public_read" on storage.objects
  for select using (bucket_id = 'annotation-media');
create policy "annotation_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'annotation-media' and is_admin());
create policy "annotation_media_admin_update" on storage.objects
  for update using (bucket_id = 'annotation-media' and is_admin());
create policy "annotation_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'annotation-media' and is_admin());
