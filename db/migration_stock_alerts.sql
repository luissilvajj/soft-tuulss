-- Migration: Stock Alerts
-- Description: Adds min_stock column to products table for configurable low-stock alerts.

-- 1. Add min_stock column (default 5 units)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- 2. Create a view for quick low-stock queries (used by Dashboard widget)
CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT 
    id,
    name,
    sku,
    stock,
    min_stock,
    organization_id
FROM public.products
WHERE stock <= min_stock
  AND is_deleted = false
ORDER BY stock ASC;
