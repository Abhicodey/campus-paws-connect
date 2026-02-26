-- Fallback for new users: if the auth trigger didn't create public.users row
-- (e.g. delay, failure, or trigger missing), the app can call this RPC to create it.
-- Safe to call multiple times: ON CONFLICT DO NOTHING.

create or replace function public.ensure_public_user(user_email text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id uuid;
    v_email text;
begin
    v_id := auth.uid();
    if v_id is null then
        return;
    end if;

    -- Use provided email or try to get from JWT (some providers set it)
    v_email := coalesce(user_email, nullif(trim(auth.jwt() ->> 'email'), ''));

    insert into public.users (id, email, role, created_at)
    values (v_id, v_email, 'student', now())
    on conflict (id) do nothing;
end;
$$;

comment on function public.ensure_public_user(text) is
  'Ensures a row exists in public.users for the current auth user. Call when profile fetch fails (e.g. new Google user before trigger runs).';
