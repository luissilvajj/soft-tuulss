-- Migration: Add payment_term_days to transactions
-- Required for credit payment sales (Ventas a Crédito)

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS payment_term_days integer;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
