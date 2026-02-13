-- Drop existing policies to ensure clean state
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Public can view avatars" on storage.objects;

-- Policy 1: Allow upload own avatar
create policy "Users can upload their own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow update own avatar
create policy "Users can update their own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow view avatars
create policy "Public can view avatars"
on storage.objects
for select
to public
using ( bucket_id = 'avatars' );
