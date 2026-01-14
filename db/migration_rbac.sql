-- MIGRATION: RBAC & Security (Phase 6)
-- 1. FIX DASHBOARD MV (Security & Concurrently Fix)
-- Drop old MV and View
DROP MATERIALIZED VIEW IF EXISTS mv_daily_sales_stats CASCADE;
DROP VIEW IF EXISTS view_sales_normalized CASCADE;

-- Re-create Normalized View with Organization ID
CREATE VIEW view_sales_normalized AS
SELECT 
    id,
    organization_id, -- Added for filtering
    date,
    amount as original_amount,
    currency,
    exchange_rate,
    status,
    CASE 
        WHEN currency = 'VES' THEN amount / NULLIF(exchange_rate, 0)
        ELSE amount 
    END AS amount_usd
FROM public.transactions
WHERE type = 'sale';

-- Re-create MV with Organization ID Grouping
CREATE MATERIALIZED VIEW mv_daily_sales_stats AS
SELECT 
    date_trunc('day', date)::date as day,
    organization_id, -- Critical for Multi-tenant security
    count(*) as total_count,
    sum(amount_usd) as total_usd
FROM view_sales_normalized -- Use the view we just made
WHERE status = 'paid'
GROUP BY 1, 2
ORDER BY 1 DESC;

-- CORRECTION: Unique Index for CONCURRENT REFRESH
CREATE UNIQUE INDEX idx_mv_daily_org_day ON mv_daily_sales_stats(organization_id, day);

-- 2. ROLES UPDATE
-- Update constraint to allow 'cashier'
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_role_check 
  CHECK (role IN ('owner', 'admin', 'member', 'cashier'));

-- 3. AUDITING: Who sold what?
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- 4. RLS POLICIES (The "Firewall")

-- A. Helper: Get my role in an org
CREATE OR REPLACE FUNCTION get_my_role(org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.organization_members 
  WHERE organization_id = org_id AND user_id = auth.uid()
$$;

-- B. LOCK DOWN INVENTORY (Products)
DROP POLICY IF EXISTS "Users can view products of their organization" ON public.products;
DROP POLICY IF EXISTS "Users can view active products" ON public.products;

-- Allow READ for everyone in org (Owner, Admin, Cashier)
CREATE POLICY "Org Members View Products" ON public.products
FOR SELECT USING (
  organization_id IN (SELECT get_auth_org_ids()) 
  AND deleted_at IS NULL
);

-- Allow WRITE ONLY for Admin/Owner
CREATE POLICY "Admins Manage Products" ON public.products
FOR ALL USING (
  organization_id IN (SELECT get_auth_org_ids()) 
  AND get_my_role(organization_id) IN ('owner', 'admin')
);

-- Note: Cashier needs to update stock via RPC (RPCs are Security Definer, so they bypass RLS on the table, which is GOOD).

-- C. LOCK DOWN SALES (Transactions)
DROP POLICY IF EXISTS "Users can view transactions of their organization" ON public.transactions;

-- Owner/Admin: See EVERYTHING
CREATE POLICY "Admins View All Transactions" ON public.transactions
FOR SELECT USING (
  organization_id IN (SELECT get_auth_org_ids()) 
  AND get_my_role(organization_id) IN ('owner', 'admin')
);

-- Cashier: See OWN transactions (Last 24h usually, but here strict ownership)
CREATE POLICY "Cashiers View Own Transactions" ON public.transactions
FOR SELECT USING (
  organization_id IN (SELECT get_auth_org_ids()) 
  AND get_my_role(organization_id) = 'cashier'
  AND created_by = auth.uid()
);

-- Cashier: Insert (Create Sale)
CREATE POLICY "Cashiers Create Transactions" ON public.transactions
FOR INSERT WITH CHECK (
  organization_id IN (SELECT get_auth_org_ids())
  -- Any member can create a sale? Or strictly cashier? Let's allow members too.
);

-- 5. FUNCTION Refresh Update
-- Same function, but now the index exists.
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_stats;
END;
$$;
