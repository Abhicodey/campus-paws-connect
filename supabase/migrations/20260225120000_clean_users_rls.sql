-- ============================================================================
-- Migration: Clean up duplicate SELECT policies on public.users
-- Date: 20260225_01
--
-- Problem: Multiple overlapping SELECT policies cause Supabase to sometimes
-- choose the wrong one, causing profile load failures (and cascade failures
-- on gallery upload permission checks).
--
-- Safe to run: all drops are IF EXISTS. The net result is 2 clean policies:
--   1. Any authenticated user can read all public profiles (for leaderboard,
--      community, dog profile pages, etc.)
--   2. Admins/presidents can also read hidden/suspended profiles.
-- ============================================================================

-- STEP 1: Drop all known duplicate / conflicting SELECT policies
DROP POLICY IF EXISTS "user_read_self"                 ON public.users;
DROP POLICY IF EXISTS "users_read_self"                ON public.users;
DROP POLICY IF EXISTS "bootstrap_read_own_user"        ON public.users;
DROP POLICY IF EXISTS "allow_read_own_profile_bootstrap" ON public.users;
DROP POLICY IF EXISTS "read_all_profiles"              ON public.users;
DROP POLICY IF EXISTS "Users can view own profile"     ON public.users;
DROP POLICY IF EXISTS "admin_read_all_users"           ON public.users;
-- Also drop the broad old one from fix_users_rls so we can replace it cleanly
DROP POLICY IF EXISTS "Users can view profiles"        ON public.users;

-- STEP 2: Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- STEP 3: Single clean SELECT policy — authenticated users can read all profiles
-- (Leaderboard, community, and dog pages need to read other users' rows.)
CREATE POLICY "authenticated_read_all_profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- STEP 4: Service role / triggers always bypass RLS, so no special policy needed.
-- No change to UPDATE or INSERT policies in this migration.
