-- FIX: Drop ALL existing conflicting policies to ensure a clean slate
-- We drop policies by name. These are the names we previously created or common defaults.

drop policy if exists "Avatar upload own folder" on storage.objects;
drop policy if exists "Avatar update own file" on storage.objects;
drop policy if exists "Avatar delete own file" on storage.objects;
drop policy if exists "Public avatar read" on storage.objects;
drop policy if exists "Avatar public read" on storage.objects;
drop policy if exists "Avatar insert own folder" on storage.objects;
drop policy if exists "Give users access to own folder 1ok12c_0" on storage.objects;
drop policy if exists "Give users access to own folder 1ok12c_1" on storage.objects;
drop policy if exists "Give users access to own folder 1ok12c_2" on storage.objects;
drop policy if exists "Give users access to own folder 1ok12c_3" on storage.objects;

-- Enable RLS (just in case)
alter table storage.objects enable row level security;

-- 1. Public Read (So images load in browser)
create policy "Avatar public read"
on storage.objects
for select
to public
using ( bucket_id = 'avatars' );

-- 2. Upload Avatar (INSERT)
create policy "Avatar insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Replace Avatar (UPDATE / Upsert)
create policy "Avatar update own file"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Delete Avatar (DELETE)
create policy "Avatar delete own file"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
