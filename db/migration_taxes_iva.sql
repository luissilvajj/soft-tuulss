-- ========================================================
-- VENEZUELAN IVA TAX ENGINE MIGRATION
-- Applies: Providencia SNAT/2024/000121 support
-- ========================================================

-- 1. EXTEND PRODUCTS TABLE
-- Every product needs a tax condition (Exempt, General 16%, Reduced 8%)
-- Defaulting existing products to 'exempt' prevents breaking current financial aggregates.
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS tax_condition text DEFAULT 'exempt' 
CHECK (tax_condition IN ('exempt', 'general', 'reduced'));

-- 2. EXTEND TRANSACTIONS TABLE
-- A transaction header must store the total breakdowns for the Z-Report
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS exempt_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_base numeric(10,2) DEFAULT 0, -- Subtotal of taxable items (General + Reduced)
ADD COLUMN IF NOT EXISTS tax_general_amount numeric(10,2) DEFAULT 0, -- The 16% calculated
ADD COLUMN IF NOT EXISTS tax_reduced_amount numeric(10,2) DEFAULT 0; -- The 8% calculated

-- 3. EXTEND TRANSACTION ITEMS (HISTORICAL SNAPSHOTS)
-- Crucial for immutability: What was the tax rule applied the exact moment this item was sold?
ALTER TABLE public.transaction_items
ADD COLUMN IF NOT EXISTS tax_condition text DEFAULT 'exempt',
ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2) DEFAULT 0; -- e.g. 16.00, 8.00, 0.00
