-- AI Infrastructure Fix
-- Purpose: Ensures the AI Analyst has the necessary view, role, and RPC function to operate safely.

-- 1. Create the AI Restricted Role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readonly') THEN
        CREATE ROLE ai_readonly;
    END IF;
END $$;

-- 2. Create the flattened view for AI analysis
CREATE OR REPLACE VIEW public.analytics_flat_sales AS
SELECT 
    t.created_at as date,
    COALESCE(c.name, 'Cliente Casual') as client_name,
    (
        SELECT string_agg(p.name, ', ')
        FROM public.transaction_items ti
        JOIN public.products p ON p.id = ti.product_id
        WHERE ti.transaction_id = t.id
    ) as product_names,
    CASE 
        WHEN t.currency = 'VES' AND t.exchange_rate > 0 THEN ROUND((t.amount / t.exchange_rate)::numeric, 2)
        ELSE ROUND(t.amount::numeric, 2)
    END as total_usd,
    t.payment_method,
    COALESCE(up.full_name, 'Sistema') as created_by_name,
    t.organization_id
FROM public.transactions t
LEFT JOIN public.clients c ON c.id = t.client_id
LEFT JOIN public.profiles up ON up.id = t.created_by
WHERE t.type = 'sale' AND t.status = 'paid';

-- 3. Grant permissions to the restricted role
GRANT SELECT ON public.analytics_flat_sales TO ai_readonly;
-- Also need access to the profiles and other linked info if needed, but for simplicity we keep it to this view.

-- 4. Create the Security Definer RPC
CREATE OR REPLACE FUNCTION public.ai_run_sql(query text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- Switch to restricted role for safety
    SET LOCAL ROLE ai_readonly;
    
    -- Execute dynamic SQL and aggregate results to JSON
    EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RESET ROLE;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
