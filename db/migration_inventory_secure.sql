-- MIGRATION: Inventory Security & Logic (Phase 3)
-- 1. ADD SAFETY CONSTRAINTS
ALTER TABLE public.products 
ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);

-- 2. ENABLE SOFT DELETE
ALTER TABLE public.products 
ADD COLUMN deleted_at timestamp with time zone default null;

-- Index for Soft Delete Performance
CREATE INDEX idx_products_deleted_at ON public.products(deleted_at);

-- Update RLS to hide deleted items by default
DROP POLICY IF EXISTS "Users can view products of their organization" ON public.products;
CREATE POLICY "Users can view products of their organization" ON public.products
FOR ALL USING (
  organization_id IN (SELECT get_auth_org_ids()) 
  AND deleted_at IS NULL
);

-- 3. RPC: SAFE DECREMENT (Prevents Race Conditions)
-- Drop old version if exists
DROP FUNCTION IF EXISTS decrement_stock(uuid, integer);

CREATE OR REPLACE FUNCTION decrement_stock(p_id uuid, q integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock integer;
BEGIN
  -- Row Locking
  SELECT stock INTO current_stock FROM public.products WHERE id = p_id FOR UPDATE;

  IF current_stock >= q THEN
    UPDATE public.products SET stock = stock - q WHERE id = p_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- 4. RPC: WEIGHTED AVERAGE COST RESTOCK
CREATE OR REPLACE FUNCTION restock_product_weighted(p_id uuid, qty_added integer, new_cost numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_stock integer;
  old_cost numeric;
  total_qty integer;
  weighted_cost numeric;
BEGIN
  SELECT stock, cost INTO old_stock, old_cost FROM public.products WHERE id = p_id;
  
  IF old_stock IS NULL THEN old_stock := 0; END IF;
  IF old_cost IS NULL THEN old_cost := 0; END IF;

  total_qty := old_stock + qty_added;

  IF total_qty > 0 THEN
      -- Formula: ((OldStock * OldCost) + (NewQty * NewCost)) / TotalQty
      weighted_cost := ((old_stock * old_cost) + (qty_added * new_cost)) / total_qty;
  ELSE
      weighted_cost := new_cost;
  END IF;

  UPDATE public.products 
  SET 
    stock = total_qty, 
    cost = ROUND(weighted_cost, 4) -- Round to 4 decimals for precision
  WHERE id = p_id;
END;
$$;
