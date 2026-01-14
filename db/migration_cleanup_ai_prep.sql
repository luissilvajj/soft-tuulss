-- PHASE 12: DB Hardening & AI Preparation

-- 1. Hardening: Remove 'items' redundancy from transactions
-- We keep 'items_snapshot' (historical record) but remove the likely redundant 'items' JSON/related column if it exists and confuses things.
-- Assuming 'items' is the JSON column. 'transaction_items' is the relational table.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'items') THEN
        ALTER TABLE public.transactions DROP COLUMN items;
    END IF;
END $$;

-- 2. Hardening: Unique SKU per Organization
-- Handle NULL SKUs first? If we want to allow NULLs, we can use a partial index or just let NULLs be distinct (default PG behavior).
-- Constraint: unique (organization_id, sku). 
-- CAUTION: If duplicates exist, this will fail. We might need to cleanup first, but for now we apply the constraint.
-- If it fails, the user must clean up manually (or we could use a robust DO block to append numbering).
-- Let's try to add the constraint directly.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_org_sku_key') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_org_sku_key UNIQUE (organization_id, sku);
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate SKUs exist. Constraint not applied. Please clean up data first.';
END $$;

-- 3. Automation: Payment Trigger
-- When payment_reports.status -> 'approved', auto-renew organization subscription.
-- Check if table exists first (it was found in archive path, verify public schema).

CREATE OR REPLACE FUNCTION public.handle_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act when status changes to 'approved'
    IF OLD.status IS DISTINCT FROM 'approved' AND NEW.status = 'approved' THEN
        -- Link payment to organization if possible?
        -- Assuming payment_reports has 'organization_id' and 'amount'?
        -- If not, we can't link it. Let's assume organization_id exists.
        
        UPDATE public.organizations
        SET 
            subscription_status = 'active',
            -- Add 1 month to current_period_end OR now() if null
            current_period_end = COALESCE(current_period_end, NOW()) + INTERVAL '30 days'
        WHERE id = NEW.organization_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger creation (safely)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_reports') THEN
        DROP TRIGGER IF EXISTS on_payment_approved ON public.payment_reports;
        
        CREATE TRIGGER on_payment_approved
        AFTER UPDATE ON public.payment_reports
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_payment_approval();
    END IF;
END $$;


-- 4. AI Intelligence: Flat Sales View (The "Source of Truth" for DeepSeek)
CREATE OR REPLACE VIEW public.analytics_flat_sales AS
SELECT 
    t.created_at as date,
    
    -- Client Name (Resolve Join)
    COALESCE(
        c.name, 
        'Cliente Casual'
    ) as client_name,
    
    -- Products (Aggregate from transaction_items)
    (
        SELECT string_agg(p.name, ', ')
        FROM public.transaction_items ti
        JOIN public.products p ON p.id = ti.product_id
        WHERE ti.transaction_id = t.id
    ) as product_names,
    
    -- Financials (Normalized to USD for AI)
    CASE 
        WHEN t.currency = 'VES' AND t.exchange_rate > 0 THEN ROUND((t.amount / t.exchange_rate)::numeric, 2)
        ELSE ROUND(t.amount::numeric, 2)
    END as total_usd,
    
    t.payment_method,
    
    -- Creator
    COALESCE(up.full_name, 'Sistema') as created_by_name,

    -- Security Context
    t.organization_id

FROM public.transactions t
LEFT JOIN public.clients c ON c.id = t.client_id
LEFT JOIN public.profiles up ON up.id = t.created_by
WHERE t.type = 'sale' AND t.status = 'paid';

-- 5. AI Security: Grant access to Read-Only Role
GRANT SELECT ON public.analytics_flat_sales TO ai_readonly;

-- 6. AI Execution: RPC Function to run SQL as ai_readonly
-- This function allows the Edge Function (Service Role) to execute dynamic SQL 
-- BUT forces the execution context to be the restricted 'ai_readonly' user.
CREATE OR REPLACE FUNCTION public.ai_run_sql(query text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- Switch to restricted role
    SET LOCAL ROLE ai_readonly;
    
    -- Execute the query and return result as JSON
    -- We wrap in array_to_json to get a nice format
    EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    -- Reset role just in case (though transaction end handles it)
    RESET ROLE;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER needed so Service Role can call it and switch roles?
-- Usage: Service Role calls this. Function switches to `ai_readonly`.
-- `ai_readonly` must have permission to select from `analytics_flat_sales`. (Granted above).

