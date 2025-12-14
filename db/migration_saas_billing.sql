-- Add SaaS Billing Fields to Organizations

-- 1. Add Trial and Stripe Columns
alter table public.organizations 
add column if not exists trial_ends_at timestamp with time zone default (now() + interval '14 days'),
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists current_period_end timestamp with time zone;

-- 2. Backfill existing organizations with a fresh 14-day trial
-- This ensures current users don't get locked out immediately
update public.organizations 
set trial_ends_at = (now() + interval '14 days') 
where trial_ends_at is null;

-- 3. Add check constraint for subscription status if not exists
-- (Already defined in schema.sql but good to reinforce or expand)
alter table public.organizations 
drop constraint if exists organizations_subscription_status_check;

alter table public.organizations 
add constraint organizations_subscription_status_check 
check (subscription_status in ('active', 'inactive', 'past_due', 'trialing', 'canceled'));
