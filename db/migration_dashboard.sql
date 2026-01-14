-- MIGRATION: BI Dashboard & Normalization
-- 1. Ensure Columns Exist (Safety Check)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,4) DEFAULT 1;

-- 2. Base View: Normalization Logic
-- Converts everything to USD based on the historical rate
CREATE OR REPLACE VIEW view_sales_normalized AS
SELECT 
    id,
    date,
    amount as original_amount,
    currency,
    exchange_rate,
    CASE 
        WHEN currency = 'VES' THEN amount / NULLIF(exchange_rate, 0)
        ELSE amount 
    END AS amount_usd,
    status
FROM public.transactions
WHERE type = 'sale'; -- Only Sales

-- 3. Optimization: Materialized View for Daily Stats
-- Aggregates data daily to avoid summing individual rows on every dashboard load.
-- Refresh Strategy: Run 'REFRESH MATERIALIZED VIEW mv_daily_sales_stats' periodically.
CREATE MATERIALIZED VIEW mv_daily_sales_stats AS
SELECT 
    date_trunc('day', date)::date as day,
    count(*) as total_count,
    sum(
        CASE 
            WHEN currency = 'VES' THEN amount / NULLIF(exchange_rate, 0)
            ELSE amount 
        END
    ) as total_usd
FROM public.transactions
WHERE type = 'sale' AND status = 'paid'
GROUP BY 1
ORDER BY 1 DESC;

-- Index for speed
CREATE INDEX idx_mv_daily_day ON mv_daily_sales_stats(day);

-- 4. Helper Function to Refresh (Can be called via RPC or pg_cron)
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_stats;
END;
$$;
