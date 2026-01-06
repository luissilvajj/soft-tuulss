-- Add payment_details column to transactions table for mixed currency support
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.transactions.payment_details IS 'Stores split payment info e.g. { usd_amount: 20, ves_amount: 500, igtf_base: 20 }';
