-- Add moderation columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username_status text DEFAULT 'approved' CHECK (username_status IN ('approved', 'pending', 'rejected')),
ADD COLUMN IF NOT EXISTS avatar_status text DEFAULT 'approved' CHECK (avatar_status IN ('approved', 'pending', 'rejected')),
ADD COLUMN IF NOT EXISTS previous_username text,
ADD COLUMN IF NOT EXISTS previous_avatar_url text;

-- Backfill existing users as approved (important for visibility)
UPDATE users 
SET username_status = 'approved', avatar_status = 'approved' 
WHERE username_status IS NULL;

-- Index for performance (since we'll query by status often)
CREATE INDEX IF NOT EXISTS idx_users_username_status ON users(username_status);
CREATE INDEX IF NOT EXISTS idx_users_avatar_status ON users(avatar_status);

-- RLS Policy: Public can only see approved profiles
-- Note: You might need to drop existing policies if they conflict, checking existing policies first is good practice.
-- But standard "Enable Read Access for all users" usually is: true. We need to restict it.

-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;

CREATE POLICY "Public sees approved users only"
ON users
FOR SELECT
USING (
  (username_status = 'approved' AND avatar_status = 'approved') 
  OR 
  (auth.uid() = id) -- Users can always see themselves
  OR
  (
    -- Allow admins (president/vice_president) to see everything
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.role IN ('president', 'vice_president')
    )
  )
);
