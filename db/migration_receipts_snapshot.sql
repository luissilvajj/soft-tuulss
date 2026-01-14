-- MIGRATION: Receipts Snapshot & immutable Data
-- Goal: Store the exact product details (Name, SKU) at the time of sale.

-- 1. Add Column (Safe if exists)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS items_snapshot JSONB DEFAULT '[]'::jsonb;

-- 2. BACKFILL (CORRECTED & OPTIMIZED)
-- We prefer 'price_at_transaction' for historical accuracy. 
-- Only use current 'p.price' if the historical price is missing (unlikely given schema).

WITH historical_data AS (
  SELECT 
    ti.transaction_id,
    jsonb_agg(
      jsonb_build_object(
        'id', ti.product_id,
        'name', COALESCE(p.name, 'Producto Borrado'),
        'qty', ti.quantity,
        'price', ti.price_at_transaction,   -- CORRECTO: Precio histórico real
        'total', (ti.quantity * ti.price_at_transaction),
        'sku', COALESCE(p.sku, 'N/A')
      )
    ) as snapshot_data
  FROM public.transaction_items ti
  LEFT JOIN public.products p ON ti.product_id = p.id
  GROUP BY ti.transaction_id
)
UPDATE public.transactions t
SET items_snapshot = hd.snapshot_data
FROM historical_data hd
WHERE t.id = hd.transaction_id
  AND (t.items_snapshot IS NULL OR jsonb_array_length(t.items_snapshot) = 0); -- Only update empty ones
