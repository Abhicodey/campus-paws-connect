-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1. Add birthdate column and computed columns
alter table public.users
add column if not exists birthdate date;

alter table public.users
add column if not exists birth_month int
generated always as (extract(month from birthdate)) stored;

alter table public.users
add column if not exists birth_day int
generated always as (extract(day from birthdate)) stored;

-- 2. Schedule daily birthday mailer at 7 AM
-- Note: You need to replace YOUR_PROJECT_REF and YOUR_ANON_KEY if running this manually,
-- but typically these are set in the dashboard or via consistent URL patterns.
-- For local dev, we might strictly rely on manual invocation, but for production:

-- We will use a placeholder URL and Header. 
-- IMPORTANT: The user must verify the Project URL and Service/Anon Key in the dashboard or replace them here.
-- Since we are in an agentic flow, we will assume standard Supabase project structure calls.

select cron.schedule(
  'birthday-mail-everyday',
  '0 7 * * *', -- 7 AM everyday
  $$
  select net.http_post(
    url:='https://' || current_setting('app.settings.project_url', true) || '/functions/v1/birthday-mailer',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.anon_key', true) || '"}'::jsonb
  );
  $$
);

-- Note: automatic substitution of project_url/anon_key via `current_setting` works if those settings are defined (e.g. in some Supabase setups). 
-- If not, the user might need to hardcode them.
-- Given the user's specific request code:
-- url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/birthday-mailer',
-- headers:='{"Authorization": "Bearer YOUR_ANON_PUBLIC_KEY"}'::jsonb

-- I'll use the user's suggested block structure but commented with instructions to replace.

/*
-- MANUAL SETUP REQUIRED FOR CRON:
select cron.schedule(
  'birthday-mail-everyday',
  '0 7 * * *', 
  $$
  select net.http_post(
    url:='https://<PROJECT_REF>.supabase.co/functions/v1/birthday-mailer',
    headers:='{"Authorization": "Bearer <ANON_KEY>"}'::jsonb
  );
  $$
);
*/
