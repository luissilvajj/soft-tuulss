-- Drop old check constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;

-- Add new constraint with all supported methods
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_payment_method_check 
CHECK (payment_method IN ('cash', 'card', 'transfer', 'mobile_pay', 'zelle', 'other'));
