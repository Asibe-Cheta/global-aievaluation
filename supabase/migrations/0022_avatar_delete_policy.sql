-- The avatars bucket (0001_init.sql) has owner insert/update policies but no
-- delete policy, so a user can never remove a previously uploaded photo.
create policy "avatar_owner_delete" on storage.objects for delete using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
