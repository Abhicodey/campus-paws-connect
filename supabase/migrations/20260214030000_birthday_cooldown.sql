-- 1. Add column to track last update time
alter table public.users
add column if not exists birthdate_updated_at timestamptz;

-- 2. Function to enforce cooldown
create or replace function limit_birthdate_changes()
returns trigger as $$
begin
  -- Allow first time set (if it was null before)
  if old.birthdate is null then
    new.birthdate_updated_at = now();
    return new;
  end if;

  -- Allow update if cooldown passed (7 days)
  if old.birthdate_updated_at < now() - interval '7 days' then
    new.birthdate_updated_at = now();
    return new;
  end if;
  
  -- If we are here, it means cooldown is active AND it's not the first set
  -- However, we should check if the actual birthdate value is changing.
  -- If birthdate is same, maybe we allow other updates? 
  -- The trigger is specifically "before update of birthdate", so this runs only when birthdate changes.
  
  raise exception 'You can change your birthdate only once every 7 days';
end;
$$ language plpgsql;

-- 3. Trigger
drop trigger if exists birthdate_cooldown on users;

create trigger birthdate_cooldown
before update of birthdate on public.users
for each row
execute function limit_birthdate_changes();

-- 4. Policy to allow users to update their own birthday (if not already covered by general update policy)
-- We already added "Users can update their own profile" which covers this, but good to be sure.
-- No extra policy needed if the general one exists.
