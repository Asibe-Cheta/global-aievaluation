-- Run this in the Supabase Dashboard SQL Editor after 0001-0009.
--
-- Lets admins attach an optional short video or audio clip to an exam
-- question (e.g. "listen to this clip and answer"), enforced <=10s
-- client-side on upload, same as lesson case-study clips.

alter table public.exam_questions
  add column if not exists media jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
  values ('exam-media', 'exam-media', true)
  on conflict (id) do nothing;

create policy "exam_media_public_read" on storage.objects
  for select using (bucket_id = 'exam-media');
create policy "exam_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'exam-media' and is_admin());
create policy "exam_media_admin_update" on storage.objects
  for update using (bucket_id = 'exam-media' and is_admin());
create policy "exam_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'exam-media' and is_admin());
