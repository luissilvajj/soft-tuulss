-- FIX MISSING COLUMNS
-- Run this if you are getting 500 errors regarding "column does not exist"

-- 1. Ensure 'subscription_status' exists
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';

-- 2. Ensure 'logo_url' exists
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url text;

-- 3. Ensure 'stripe_customer_id' exists (Just in case)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- 4. Verify Constraints
ALTER TABLE public.organizations 
DROP CONSTRAINT IF EXISTS organizations_subscription_status_check;

ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'trialing', 'canceled'));
