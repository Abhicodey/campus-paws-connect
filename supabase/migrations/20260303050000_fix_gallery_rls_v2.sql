-- ============================================================================
-- Migration: Fix gallery_images RLS - v2 (clean slate)
-- Date: 20260303
--
-- Problem: The president SELECT policy was using a slow subquery on public.users.
-- Replace with JWT-based role check which is faster and avoids any potential
-- recursion. Also fixes the INSERT policy from `public` → `authenticated`.
--
-- NOTE: auth.jwt() ->> 'role' reads from the JWT token returned by Supabase.
-- For this to work, the user's role MUST be set in their auth.users app_metadata.
-- If role is ONLY in public.users, use the subquery variant below instead.
--
-- ⚠️  SAFE to re-run: all drops are IF EXISTS.
-- ============================================================================

-- 1. Drop ALL existing SELECT policies (belt-and-suspenders)
DROP POLICY IF EXISTS "view_approved"                      ON public.gallery_images;
DROP POLICY IF EXISTS "allow_view_approved"                ON public.gallery_images;
DROP POLICY IF EXISTS "select_approved_gallery"            ON public.gallery_images;
DROP POLICY IF EXISTS "students_view_approved_gallery"     ON public.gallery_images;
DROP POLICY IF EXISTS "president_read_all_gallery_images"  ON public.gallery_images;
DROP POLICY IF EXISTS "president_read_all_gallery"         ON public.gallery_images;
DROP POLICY IF EXISTS "public_read_approved_gallery"       ON public.gallery_images;

-- 2. Drop existing INSERT policies
DROP POLICY IF EXISTS "upload_image"                       ON public.gallery_images;
DROP POLICY IF EXISTS "allow_upload_image"                 ON public.gallery_images;
DROP POLICY IF EXISTS "insert_own_gallery_image"           ON public.gallery_images;

-- 3. Drop existing UPDATE/DELETE policies
DROP POLICY IF EXISTS "president_manage"                   ON public.gallery_images;
DROP POLICY IF EXISTS "allow_president_manage"             ON public.gallery_images;
DROP POLICY IF EXISTS "president_manage_gallery"           ON public.gallery_images;
DROP POLICY IF EXISTS "president_delete_gallery"           ON public.gallery_images;

-- 4. Ensure RLS is on
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Anyone (anon + authenticated) can read approved, visible images (gallery page)
CREATE POLICY "public_read_approved_gallery"
ON public.gallery_images
FOR SELECT
TO anon, authenticated
USING (
    status = 'approved'
    AND (is_hidden IS NULL OR is_hidden = false)
);

-- Presidents/admins can read EVERYTHING (pending + approved + hidden)
-- Uses subquery on public.users since role lives there, not in JWT app_metadata
CREATE POLICY "president_read_all_gallery"
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

-- ============================================================================
-- INSERT POLICY — students upload into pending/
-- ============================================================================

CREATE POLICY "upload_image"
ON public.gallery_images
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- UPDATE POLICY — presidents approve/reject/hide
-- ============================================================================

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

-- ============================================================================
-- DELETE POLICY — presidents can delete rejected images
-- ============================================================================

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
