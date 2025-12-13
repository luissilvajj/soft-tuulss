-- Add advanced sales columns to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD' CHECK (currency IN ('USD', 'VES')),
ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_iva numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_igtf numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_exempt boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
