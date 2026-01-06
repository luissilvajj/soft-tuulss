-- NUCLEAR FIX: V3
-- Call this function get_web_user_organizations_v3 to avoid any V2 caching issues
-- Run this ENTIRE file in Supabase SQL Editor

-- 1. CLEANUP POLICIES (Aggressive)
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting policies (Old & New names)
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "read_own_membership" ON public.organization_members;
DROP POLICY IF EXISTS "fix_own_membership" ON public.organization_members; -- Added this

-- Simple, non-recursive policy
CREATE POLICY "fix_own_membership" ON public.organization_members 
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "read_own_organizations" ON public.organizations;
DROP POLICY IF EXISTS "fix_own_organizations" ON public.organizations; -- Added this

-- Simple, non-recursive policy
CREATE POLICY "fix_own_organizations" ON public.organizations 
FOR SELECT USING (
    id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
);

-- 2. ENSURE COLUMNS (Again)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url text;

-- 3. CREATE RPC V3
CREATE OR REPLACE FUNCTION public.get_web_user_organizations_v3(target_uid uuid)
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
            COALESCE(o.subscription_status, 'active') as subscription_status, 
            o.logo_url,
            m.role
        FROM organization_members m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.user_id = target_uid
    ) t;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_web_user_organizations_v3 TO authenticated;
