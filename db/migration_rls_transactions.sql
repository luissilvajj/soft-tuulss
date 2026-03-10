-- MIGRATION: RLS Security Policies for Transactions & Items
-- Phase 6: Security & Hermetic Isolation

-- 1. Ensure RLS is enabled on the tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to avoid conflicts (if they were created manually)
DROP POLICY IF EXISTS "Users can view transactions of their organization" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert transactions for their organization" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions of their organization" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions of their organization" ON public.transactions;

DROP POLICY IF EXISTS "Users can view transaction items of their org" ON public.transaction_items;
DROP POLICY IF EXISTS "Users can insert transaction items for their org" ON public.transaction_items;
DROP POLICY IF EXISTS "Users can update transaction items of their org" ON public.transaction_items;
DROP POLICY IF EXISTS "Users can delete transaction items of their org" ON public.transaction_items;

-- 3. Create Hermetic Policies for TRANSACTIONS table
-- A user can only SELECT transactions that belong to an organization they are a member of.
CREATE POLICY "Users can view transactions of their organization"
ON public.transactions
FOR SELECT
USING (
  organization_id IN (SELECT get_auth_org_ids())
);

-- A user can only INSERT transactions into an organization they belong to.
CREATE POLICY "Users can insert transactions for their organization"
ON public.transactions
FOR INSERT
WITH CHECK (
  organization_id IN (SELECT get_auth_org_ids())
);

-- A user can only UPDATE transactions that belong to their organization.
CREATE POLICY "Users can update transactions of their organization"
ON public.transactions
FOR UPDATE
USING (
  organization_id IN (SELECT get_auth_org_ids())
);

-- A user can only DELETE transactions that belong to their organization.
CREATE POLICY "Users can delete transactions of their organization"
ON public.transactions
FOR DELETE
USING (
  organization_id IN (SELECT get_auth_org_ids())
);

-- 4. Create Hermetic Policies for TRANSACTION_ITEMS table
CREATE POLICY "Users can view transaction items of their org"
ON public.transaction_items
FOR SELECT
USING (
  organization_id IN (SELECT get_auth_org_ids())
);

CREATE POLICY "Users can insert transaction items for their org"
ON public.transaction_items
FOR INSERT
WITH CHECK (
  organization_id IN (SELECT get_auth_org_ids())
);

CREATE POLICY "Users can update transaction items of their org"
ON public.transaction_items
FOR UPDATE
USING (
  organization_id IN (SELECT get_auth_org_ids())
);

CREATE POLICY "Users can delete transaction items of their org"
ON public.transaction_items
FOR DELETE
USING (
  organization_id IN (SELECT get_auth_org_ids())
);
