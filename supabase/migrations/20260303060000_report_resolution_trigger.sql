-- ============================================================================
-- Migration: Report resolution trigger (v2 - fixed SECURITY DEFINER)
-- Date: 20260303
--
-- Fix: Added `SET search_path = public` to the SECURITY DEFINER function.
-- Without this, PostgreSQL may use a different search_path when running as
-- the table owner, causing the UPDATE statements inside to fail silently
-- (unable to find gallery_images / dogs tables).
--
-- This is the correct, production-safe version.
-- Safe to re-run: drops are IF EXISTS.
-- ============================================================================

-- Step 1: Drop trigger first, then function (order matters due to dependency)
DROP TRIGGER IF EXISTS resolve_report_trigger ON public.user_reports;
DROP FUNCTION IF EXISTS handle_report_resolution();

-- Step 2: Recreate function with SECURITY DEFINER + explicit search_path
CREATE OR REPLACE FUNCTION handle_report_resolution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER                -- Run as table owner, bypassing RLS
SET search_path = public        -- ✅ Critical: ensures UPDATE finds the correct schema
AS $$
BEGIN
    -- Only fire when status transitions TO 'action_taken'
    IF NEW.status = 'action_taken' AND (OLD.status IS DISTINCT FROM 'action_taken') THEN

        IF NEW.target_type = 'image' THEN
            UPDATE gallery_images
            SET
                is_hidden = true,
                status    = 'hidden'
            WHERE id = NEW.target_id;

        ELSIF NEW.target_type = 'dog' THEN
            UPDATE dogs
            SET
                is_hidden = true,
                status    = 'hidden',
                verified  = false
            WHERE id = NEW.target_id;

        ELSIF NEW.target_type = 'user' THEN
            UPDATE users
            SET is_hidden = true
            WHERE id = NEW.target_id;

        END IF;

    END IF;

    RETURN NEW;
END;
$$;

-- Step 3: Recreate trigger
CREATE TRIGGER resolve_report_trigger
AFTER UPDATE OF status ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION handle_report_resolution();
