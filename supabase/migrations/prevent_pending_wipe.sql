-- SAFETY NET: Prevent accidental wiping of username_pending
-- This trigger ensures that if username_pending is set, it cannot be silently set to NULL
-- unless the status is also changing (processed) or it's an intentional reject/approve.

create or replace function prevent_pending_wipe()
returns trigger as $$
begin
  -- IF old has a pending request AND new has NULL pending request
  -- AND the status hasn't changed (meaning it wasn't approved or rejected)
  -- THEN it must be an accidental full-object update from frontend
  if OLD.username_pending is not null
     and NEW.username_pending is null
     and NEW.username_status = OLD.username_status then
    
    -- Exception: Allow super admins or specific logic if needed, but for now block it.
    -- We can just restore the old value instead of raising exception to be smoother.
    NEW.username_pending := OLD.username_pending;
    
    -- Optional: Log warning if you have a logs table
    -- raise notice 'Prevented accidental wipe of username_pending for user %', NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Re-create the trigger
drop trigger if exists prevent_pending_wipe_trigger on users;
create trigger prevent_pending_wipe_trigger
before update on users
for each row
execute function prevent_pending_wipe();
