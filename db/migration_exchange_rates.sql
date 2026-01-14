-- Migration: Exchange Rates Cache System
-- Description: Creates table for caching exchange rates and sets up Cron job
-- Author: Antigravity Agent

-- 1. Create table
create table if not exists public.sys_exchange_rates (
  id uuid default uuid_generate_v4() primary key,
  currency_pair text not null unique, -- e.g., 'USD-VES'
  rate numeric(10, 4) not null,
  last_update timestamp with time zone default timezone('utc'::text, now()) not null,
  source text default 'BCV'
);

-- 2. Enable RLS
alter table public.sys_exchange_rates enable row level security;

-- 3. Strict RLS Policies
-- Allow anyone (authenticated or anon) to READ the rate
create policy "Public read access to exchange rates"
  on public.sys_exchange_rates
  for select
  using (true);

-- Allow ONLY service_role (Edge Functions) to INSERT/UPDATE
-- This prevents users from manipulating the rate
create policy "Service role sync access"
  on public.sys_exchange_rates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 4. PG_CRON Setup
-- IMPORTANT: You must enable the 'pg_cron' extension in Supabase Dashboard first.
-- Dashboard -> Database -> Extensions -> pg_cron

create extension if not exists pg_cron;

-- Schedule the Edge Function to run every hour at minute 0
-- Note: Replace 'PROJECT_REF' and 'ANON_KEY' with your actual project details if invoking via SQL,
-- BUT the recommended way for Supabase is to use the UI or CLI to schedule the function.
-- Alternatively, if using database-native cron to call the URL:

-- select cron.schedule(
--   'sync-exchange-rate-hourly',
--   '0 * * * *', -- Every hour
--   $$
--   select
--     net.http_post(
--       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-exchange-rate',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--       body:='{}'::jsonb
--     ) as request_id;
--   $$
-- );

-- For now, we just create the table. The Cron schedule should ideally be managed via Supabase Platform UI 
-- or by running the 'cron.schedule' command manually after configuring secrets.
