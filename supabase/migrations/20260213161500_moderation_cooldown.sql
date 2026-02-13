-- Add cooldown columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username_last_changed timestamptz,
ADD COLUMN IF NOT EXISTS next_username_change timestamptz;

-- Function to prevent early changes
CREATE OR REPLACE FUNCTION prevent_early_username_request()
RETURNS trigger AS $$
BEGIN
  -- Check if username_pending is being changed (i.e. a new request is being made)
  IF NEW.username_pending IS DISTINCT FROM OLD.username_pending AND NEW.username_pending IS NOT NULL THEN

    IF OLD.next_username_change IS NOT NULL
       AND NOW() < OLD.next_username_change THEN

       RAISE EXCEPTION
       'You can change username again after %',
       OLD.next_username_change;

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS username_change_guard ON users;

CREATE TRIGGER username_change_guard
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_early_username_request();
