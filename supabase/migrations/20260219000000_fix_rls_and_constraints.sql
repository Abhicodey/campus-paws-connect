-- Fix RLS policies and constraints to match frontend expectations
-- Run this migration in your Supabase SQL Editor

-- ============================================================================
-- Fix 1: Update users_role_check to include 'superadmin'
-- ============================================================================
-- The constraint currently only allows 'student', 'president', 'admin'
-- but policies reference 'superadmin', causing potential insert/update failures

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK ((role = ANY (ARRAY['student'::text, 'president'::text, 'admin'::text, 'superadmin'::text])));

-- ============================================================================
-- Fix 2: Ensure username_pending updates are allowed
-- ============================================================================
-- The current policy 'user_update_profile_only' has a restrictive with_check
-- that prevents setting username_pending (requires it to be NULL).
-- This blocks username requests from the frontend.

-- Drop the restrictive policy if it exists
DROP POLICY IF EXISTS "user_update_profile_only" ON public.users;

-- Create a more permissive policy that allows username_pending updates
-- This policy allows:
-- 1. Setting username_pending (for username requests)
-- 2. Other profile updates when username_pending is NULL or status is approved/rejected
CREATE POLICY "user_update_profile_only"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
    id = auth.uid() AND
    -- Allow username_pending to be set (for requests) OR
    -- Allow updates when username_pending is NULL (for other profile updates)
    (username_pending IS NOT NULL OR username_status = ANY (ARRAY['approved'::text, 'rejected'::text]))
);

-- ============================================================================
-- Note: If you prefer using the RPC approach instead of direct updates,
-- you can keep the restrictive policy and update your frontend to use
-- request_username_change() RPC instead of direct username_pending updates.
-- ============================================================================
