-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Policy 1: Allow users to upload their own avatar (INSERT)
create policy "Avatar upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to update/replace avatar (UPDATE)
create policy "Avatar update own file"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow users to delete their avatar (DELETE)
create policy "Avatar delete own file"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow public read (SELECT)
create policy "Public avatar read"
on storage.objects
for select
to public
using ( bucket_id = 'avatars' );
