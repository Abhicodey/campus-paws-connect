-- FIX: Ensure RLS policies exist for users table to allow updates

-- Enable RLS just in case
alter table public.users enable row level security;

-- Drop potentially conflicting policies to ensure clean state
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Enable update for users based on email" on public.users;
drop policy if exists "Users can view profiles" on public.users;
drop policy if exists "Enable read access for all users" on public.users;

-- Policy 1: User can update own profile (UPDATE)
create policy "Users can update their own profile"
on public.users
for update
to authenticated
using ( auth.uid() = id )
with check ( auth.uid() = id );

-- Policy 2: Allow select for authenticated users (SELECT)
-- This allows users to view other profiles (e.g. for leaderboard, community)
create policy "Users can view profiles"
on public.users
for select
to authenticated
using ( true );

-- Note: We generally also want a policy for INSERT if users are created via client-side auth, 
-- but Supabase usually handles the initial user creation via triggers on auth.users. 
-- If you need public read access (for unauthenticated landing pages etc), change "to authenticated" to "to public".
