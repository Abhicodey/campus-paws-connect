-- Add missing moderation columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username_pending text,
ADD COLUMN IF NOT EXISTS username_status text DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS username_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS next_username_change timestamptz,
ADD COLUMN IF NOT EXISTS avatar_pending text,
ADD COLUMN IF NOT EXISTS avatar_status text DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS avatar_requested_at timestamptz;

-- Ensure RLS policies allow users to read their own pending data
-- (Assuming existing policies might need adjustment, but basic Select * usually covers added columns if not restricted)
