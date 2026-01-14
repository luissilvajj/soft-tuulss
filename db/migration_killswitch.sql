-- MIGRATION: Subscription Hardening (Phase 9)

-- 1. ADD TRACKING COLUMN
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS last_payment_failure timestamp with time zone;

-- 2. UPDATE FUNCTION TO BE STRICT (Kill Switch Logic)
-- Original was just membership check. Now it enforces payment status.

CREATE OR REPLACE FUNCTION get_auth_org_ids()
RETURNS setof uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT o.id
  FROM public.organization_members m
  JOIN public.organizations o ON m.organization_id = o.id
  WHERE m.user_id = auth.uid()
  AND (
      -- Case A: Active or Trialing (Healthy)
      o.subscription_status IN ('active', 'trialing')
      
      -- Case B: Grace Period (Past Due but < 5 days since failure)
      OR (
          o.subscription_status = 'past_due' 
          AND o.last_payment_failure > (now() - interval '5 days')
      )
      
      -- Case C: Legacy/Null status handled as 'active' for MVP? 
      -- NO. Strict mode. If null, blocked unless logic elsewhere sets default.
      -- Schema default is 'active', so new orgs are safe.
  );
$$;

-- 3. UPDATE ORGANIZATION VISIBILITY POLICY
-- We must allow users to see their organization metadata in the 'Settings' page 
-- even if they are blocked, so they can pay.
-- The previous policy used 'get_auth_org_ids()' which is now STRICT.
-- We replace it with a direct membership check.

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their organizations" ON public.organizations
FOR SELECT USING (
  id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
  )
);

-- Note: All OTHER policies (Products, Sales) still use 'get_auth_org_ids()', 
-- so they inherit the STRICT protection.
