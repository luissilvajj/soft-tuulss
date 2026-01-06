-- Add payment details to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'other'));

-- Update RLS if needed (already covers all columns)
