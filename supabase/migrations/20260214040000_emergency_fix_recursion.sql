-- EMERGENCY FIX: Infinite Recursion on Users Table

-- 1. Dynamic block to DROP ALL policies on the 'users' table
-- This ensures we remove any hidden, duplicate, or recursive policies causing the loop.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY "' || r.policyname || '" ON public.users';
    END LOOP;
END $$;

-- 2. Re-enable RLS (just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Re-create CLEAN, NON-RECURSIVE policies

-- Policy A: View Profiles (SELECT)
-- Simple: Authenticated users can view all profiles.
-- No recursion because it uses "true", not a subquery.
CREATE POLICY "Users can view all profiles"
ON public.users
FOR SELECT
TO authenticated
USING ( true );

-- Policy B: Update Own Profile (UPDATE)
-- Simple: Users can only update their own row.
-- No recursion because auth.uid() is a system function, not a table query.
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING ( auth.uid() = id );

-- Optional: Insert Policy (if needed for signups not handled by triggers)
-- Usually Supabase handles insert via auth trigger, but if you need manual insert:
-- CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
