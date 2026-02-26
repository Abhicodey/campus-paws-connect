-- 1. TRIGGER: Prevent early username change
create or replace function prevent_early_username_change()
returns trigger as $$
begin
  -- allow request anytime
  if NEW.username_pending is distinct from OLD.username_pending then
    NEW.username_status := 'pending';
    return NEW;
  end if;

  -- block actual username change before cooldown
  -- Only block if the username is actually changing 
  if NEW.username is distinct from OLD.username then
    if OLD.next_username_change is not null
       and now() < OLD.next_username_change then
      raise exception 'Cooldown active: You cannot change your username yet.';
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Re-create the trigger if it doesn't exist or update it
drop trigger if exists prevent_username_change on users;
create trigger prevent_username_change
before update on users
for each row
execute function prevent_early_username_change();


-- 2. RPC: Approve Username
create or replace function approve_username(target_user uuid)
returns void as $$
begin
  update users
  set username = username_pending,
      username_pending = null,
      username_status = 'approved',
      username_last_changed = now(),
      next_username_change = now() + interval '30 days'
  where id = target_user;
end;
$$ language plpgsql security definer;


-- 3. RPC: Reject Username
create or replace function reject_username(target_user uuid)
returns void as $$
begin
  update users
  set username_pending = null,
      username_status = 'rejected'
  where id = target_user;
end;
$$ language plpgsql security definer;
