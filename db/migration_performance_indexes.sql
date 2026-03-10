-- MIGRATION: SQL Performance Indexes for High Volume
-- Phase 7: Optimization & Query Performance

-- 1. Index for Organization Isolation (Most Frequent Query)
-- Every single RLS and dashboard query filters by organization_id
CREATE INDEX IF NOT EXISTS idx_transactions_org ON public.transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_org ON public.transaction_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_org ON public.inventory_ledger(organization_id);

-- 2. Index for Date Ranges (Dashboards, Reports, Charts)
-- BRIN (Block Range Index) is excellent and very lightweight for sequential timestamp data like sales
CREATE INDEX IF NOT EXISTS idx_transactions_date_brin ON public.transactions USING brin(date);
-- Standard B-Tree for created_at if used for sorting
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created_at ON public.inventory_ledger(created_at DESC);

-- 3. Index for Foreign Keys (Joins consistency and speed)
CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_txn ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON public.transaction_items(product_id);

-- 4. Text Search Indexes (For search bars in Nuxt)
-- Assuming users search products by name or SKU frequently:
-- Using standard B-Tree for exact matches, or trigram (pg_trgm) for partial matches if the extension is enabled.
-- We stick to standard B-Tree for now for simple prefix searches (LIKE 'Product%')
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
