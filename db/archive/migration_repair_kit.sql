-- REPAIR KIT: Fix everything related to organizations
-- Run this entire script in the Supabase SQL Editor to fix the 500 Errors.

-- 1. Fix Columns (Ensure table structure is correct)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url text;

-- 2. Fix RLS (Row Level Security) - Essential for the fallback query to work
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Re-create policies to ensure users can see their own data
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
CREATE POLICY "Users can view own membership" ON public.organization_members FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations" ON public.organizations FOR SELECT USING (id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

-- 3. Create or Replace RPC V2 (High Performance Fetch)
-- This function uses SECURITY DEFINER to ensure it works even if RLS is tricky
CREATE OR REPLACE FUNCTION public.get_web_user_organizations_v2(target_uid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            o.id, 
            o.name, 
            o.subscription_status, 
            o.logo_url,
            m.role
        FROM organization_members m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.user_id = target_uid
    ) t;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.get_web_user_organizations_v2 TO authenticated;
