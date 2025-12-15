-- Enable RLS on organizations if not enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own organizations" ON organizations;
DROP POLICY IF EXISTS "Members can view organization details" ON organizations;

-- Create a policy that allows members to view ALL columns of their organization
CREATE POLICY "Members can view organization details"
ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Ensure organization_members is also readable
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;

CREATE POLICY "Users can view their own memberships"
ON organization_members
FOR SELECT
USING (
  user_id = auth.uid()
);
