-- Drop the partial SELECT-only policy
DROP POLICY IF EXISTS "Users can view transaction items of their organization" ON public.transaction_items;

-- Create a full permission policy for transaction items (Insert, Select, Update, Delete)
-- Checking that the organization_id matches one the user belongs to.
CREATE POLICY "Users can manage transaction items of their organization" ON public.transaction_items
  FOR ALL USING (organization_id IN (SELECT public.get_auth_org_ids()));
