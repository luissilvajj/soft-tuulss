-- EMERGENCY FIX: Restore Read Access to Organizations
-- Run this in Supabase SQL Editor immediately!

-- 1. Reset Organization Members Policies
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;

-- Allow users to see rows where they are the user
CREATE POLICY "Users can view own membership"
ON public.organization_members
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Reset Organizations Policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Members can view organization details" ON public.organizations;

-- Allow users to see organizations they belong to
CREATE POLICY "Users can view their organizations"
ON public.organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- 3. Verify Helper Function (Optional but good for other policies)
CREATE OR REPLACE FUNCTION get_auth_org_ids()
RETURNS setof uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
$$;
