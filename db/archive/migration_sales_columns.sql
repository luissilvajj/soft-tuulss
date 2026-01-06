-- Migration: Add detailed financial columns to transactions
-- To support full sales features

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,4),
ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_iva numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_igtf numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- Also update transaction_items to support per-item discount
ALTER TABLE public.transaction_items
ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0;

-- Refresh cache hint
NOTIFY pgrst, 'reload schema';
