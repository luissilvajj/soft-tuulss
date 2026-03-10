-- MIGRATION: Fix Currency Views (Phase 11)
-- El ERP guarda el monto de la transacción ("amount") SIEMPRE en Dólares (Moneda Base Nominal), 
-- sin importar si el usuario seleccionó pagar en Bolívares (VES).
-- Por ende, la vista anterior estaba re-dividiendo erróneamente un monto que ya estaba en Dólares.

-- 1. FIX DASHBOARD MV
DROP MATERIALIZED VIEW IF EXISTS mv_daily_sales_stats CASCADE;
DROP VIEW IF EXISTS view_sales_normalized CASCADE;

-- Re-crear Vista Normalizada asegurando que "amount" ES "amount_usd" inmutablemente.
CREATE VIEW view_sales_normalized AS
SELECT 
    id,
    organization_id,
    date,
    amount as original_amount,
    currency,
    exchange_rate,
    status,
    amount AS amount_usd -- Correction: Directly map without conditional division
FROM public.transactions
WHERE type = 'sale';

-- Re-crear Vista Materializada Aggregated
CREATE MATERIALIZED VIEW mv_daily_sales_stats AS
SELECT 
    date_trunc('day', date)::date as day,
    organization_id,
    count(*) as total_count,
    sum(amount_usd) as total_usd
FROM view_sales_normalized
WHERE status = 'paid'
GROUP BY 1, 2
ORDER BY 1 DESC;

-- Re-aplicar el Índice Único para Refresco Concurrente
CREATE UNIQUE INDEX idx_mv_daily_org_day ON mv_daily_sales_stats(organization_id, day);

-- 2. Refrescar Vista manualmente por precaución inicial.
REFRESH MATERIALIZED VIEW mv_daily_sales_stats;
