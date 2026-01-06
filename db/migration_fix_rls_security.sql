-- SECURITY FIX: Prevent unauthorized organization joining
-- Date: 2026-01-06
-- Description: Revoke permissions that allowed users to insert themselves into organizations directly.

-- 1. Drop the insecure policy
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.organization_members;

-- 2. Create a restricted policy (Explicitly false for normal INSERTs)
-- Users should NOT be able to insert rows here directly via the client API.
-- They must go through the 'team_invite' system or a secure RPC function.
CREATE POLICY "Deny all direct inserts"
ON public.organization_members
FOR INSERT
WITH CHECK (false);

-- 3. Ensure SELECT is still allowed (for viewing own memberships)
-- This was already handled by "Users can view their own memberships" in previous scripts,
-- but we ensure we haven't broken visibility.
-- (No change needed for SELECT if previous policies are intact)

-- 4. Verification Note:
-- After applying this, any call to supabase.from('organization_members').insert({...}) from the client
-- will FAIL with a permissions error. This is the desired behavior.
