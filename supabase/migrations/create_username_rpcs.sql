-- Function to approve a username request
create or replace function approve_username(target_user uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Update the user record atomically
  update public.users
  set username = username_pending,
      username_pending = null,
      username_status = 'approved',
      username_last_changed = now(),
      next_username_change = now() + interval '30 days'
  where id = target_user;
end;
$$;

-- Function to reject a username request
create or replace function reject_username(target_user uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Update the user record atomically
  update public.users
  set username_pending = null,
      username_status = 'rejected'
  where id = target_user;
end;
$$;
