-- ============================================================================
-- Migration: Fix dog insert policy to enforce pending-only submissions
-- Date: 20260225_02
--
-- Problem: The original "Users can insert dogs" policy uses with_check = true
-- which allows any authenticated user to insert dogs with any status, including
-- pre-approved ones. This bypasses president approval flow.
--
-- Fix: Users may only submit dogs where:
--   • created_by = their own auth.uid()
--   • status = 'pending'
--   • verified = false
-- Presidents/admins can still update status/verified via existing policies.
-- ============================================================================

-- Drop the over-permissive original policy
DROP POLICY IF EXISTS "Users can insert dogs"          ON public.dogs;
DROP POLICY IF EXISTS "user_insert_without_qr"         ON public.dogs;

-- Clean pending-only insert for all authenticated users
CREATE POLICY "users_submit_pending_dogs"
ON public.dogs
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = created_by
    AND status = 'pending'
    AND verified = false
);

-- Make sure president/admin can still do unrestricted inserts (e.g. direct adds)
-- Uses existing admin policy name pattern — drop first so we don't get duplicates.
DROP POLICY IF EXISTS "admin_insert_dogs" ON public.dogs;

CREATE POLICY "admin_insert_dogs"
ON public.dogs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role IN ('president', 'admin')
    )
);
