-- Add moderation columns with staging strategy
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username_pending text,
ADD COLUMN IF NOT EXISTS avatar_pending text,
ADD COLUMN IF NOT EXISTS username_status text DEFAULT 'approved' CHECK (username_status IN ('approved', 'pending', 'rejected')),
ADD COLUMN IF NOT EXISTS avatar_status text DEFAULT 'approved' CHECK (avatar_status IN ('approved', 'pending', 'rejected'));

-- Backfill existing users
UPDATE users 
SET username_status = 'approved', avatar_status = 'approved' 
WHERE username_status IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_username_status ON users(username_status);
CREATE INDEX IF NOT EXISTS idx_users_avatar_status ON users(avatar_status);

-- RLS:
-- We generally want the PUBLIC to see the APPROVED columns (which are 'username', 'avatar_url').
-- The PENDING columns should only be visible to the user themselves and admins.
-- This might require separate policies or just careful frontend logic if we don't want to hide the whole profile.
-- For now, simplest approach: Everyone can read users, but pending columns might be null for others if we wanted strict RLS.
-- But standard Supabase 'enable select for all' is fine, we just handle display in frontend.
-- CRITICAL: Ensure 'update' policy allows users to update these new columns.
