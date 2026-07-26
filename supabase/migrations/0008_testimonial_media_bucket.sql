-- Run this in the Supabase Dashboard SQL Editor after 0001-0007.
--
-- Lets admins upload a photo for a testimonial instead of only pasting
-- an avatar URL. Same admin-write / public-read pattern as annotation-media.

insert into storage.buckets (id, name, public)
  values ('testimonial-media', 'testimonial-media', true)
  on conflict (id) do nothing;

create policy "testimonial_media_public_read" on storage.objects
  for select using (bucket_id = 'testimonial-media');
create policy "testimonial_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'testimonial-media' and is_admin());
create policy "testimonial_media_admin_update" on storage.objects
  for update using (bucket_id = 'testimonial-media' and is_admin());
create policy "testimonial_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'testimonial-media' and is_admin());
