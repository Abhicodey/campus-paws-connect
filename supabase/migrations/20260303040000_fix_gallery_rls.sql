-- ============================================================================
-- Migration: Fix gallery_images RLS policies
-- Date: 20260303
--
-- Problem: The existing `view_approved` SELECT policy only allows reading
-- rows where status = 'approved'. This blocks presidents/admins from seeing
-- pending images in the Admin Panel, since usePendingImages() queries:
--   .eq('status', 'pending')
-- which returns empty for everyone.
--
-- Fix: Drop the overly-broad `view_approved` policy and replace it with:
--   1. Students/public: can only see approved, non-hidden images (same as before)
--   2. President/admin/superadmin: can see ALL images (pending + approved)
--
-- Also ensure the `upload_image` INSERT policy uses `to authenticated`
-- (not the old `to public`) to match Supabase role semantics.
-- ============================================================================

-- STEP 1: Drop all old SELECT policies on gallery_images
DROP POLICY IF EXISTS "view_approved"               ON public.gallery_images;
DROP POLICY IF EXISTS "allow_view_approved"         ON public.gallery_images;
DROP POLICY IF EXISTS "select_approved_gallery"     ON public.gallery_images;
DROP POLICY IF EXISTS "president_read_all_gallery_images" ON public.gallery_images;

-- STEP 2: Make sure RLS is enabled
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- STEP 3a: Students / regular authenticated users → only approved, non-hidden images
CREATE POLICY "students_view_approved_gallery"
ON public.gallery_images
FOR SELECT
TO authenticated
USING (
    status = 'approved'
    AND (is_hidden IS NULL OR is_hidden = false)
);

-- STEP 3b: Presidents and admins → can read ALL images (pending + approved)
-- This is required for the Admin Panel usePendingImages() query to work.
CREATE POLICY "president_read_all_gallery_images"
ON public.gallery_images
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role IN ('president', 'admin', 'superadmin')
    )
);

-- STEP 4: Ensure INSERT policy is on `authenticated` role (not `public`)
DROP POLICY IF EXISTS "upload_image"                ON public.gallery_images;
DROP POLICY IF EXISTS "allow_upload_image"          ON public.gallery_images;
DROP POLICY IF EXISTS "insert_own_gallery_image"    ON public.gallery_images;

CREATE POLICY "upload_image"
ON public.gallery_images
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- STEP 5: Ensure UPDATE policy for president approval/rejection
DROP POLICY IF EXISTS "president_manage"            ON public.gallery_images;
DROP POLICY IF EXISTS "allow_president_manage"      ON public.gallery_images;

CREATE POLICY "president_manage_gallery"
ON public.gallery_images
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role IN ('president', 'admin', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role IN ('president', 'admin', 'superadmin')
    )
);

-- STEP 6: Ensure DELETE policy for president rejection (useRejectImage deletes the row)
DROP POLICY IF EXISTS "president_delete_gallery"    ON public.gallery_images;

CREATE POLICY "president_delete_gallery"
ON public.gallery_images
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role IN ('president', 'admin', 'superadmin')
    )
);
