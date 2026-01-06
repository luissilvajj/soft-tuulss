-- Enable RLS on tables if not already enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES TO AVOID CONFLICTS
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Members can view organization details" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.organization_members;


-- RE-CREATE POLICIES

-- Policy 1: Allow users to view their own member rows
CREATE POLICY "Users can view their own memberships" 
ON public.organization_members 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Allow users to view organizations they are a member of
CREATE POLICY "Members can view organization details" 
ON public.organizations 
FOR SELECT 
USING (
    exists (
        select 1 
        from public.organization_members om 
        where om.organization_id = id 
        and om.user_id = auth.uid()
    )
);

-- Policy 3: Allow users to create organizations
-- (Removed check for 'created_by' column since it does not exist)
CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 4: Allow users to create their own initial membership (admin)
CREATE POLICY "Users can insert their own membership" 
ON public.organization_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
