-- Run this in the Supabase Dashboard SQL Editor after 0001-0008.
--
-- Lets admins attach short video/audio clips to a lesson's Mini Case
-- Studies (max 2 videos + 2 audio clips per case study, each <=10s,
-- enforced client-side on upload) instead of only a text scenario.
-- No schema change needed for `lessons.mini_case_studies` itself since
-- it's already jsonb — media is just a new key on each case study object.

insert into storage.buckets (id, name, public)
  values ('lesson-media', 'lesson-media', true)
  on conflict (id) do nothing;

create policy "lesson_media_public_read" on storage.objects
  for select using (bucket_id = 'lesson-media');
create policy "lesson_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'lesson-media' and is_admin());
create policy "lesson_media_admin_update" on storage.objects
  for update using (bucket_id = 'lesson-media' and is_admin());
create policy "lesson_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'lesson-media' and is_admin());
