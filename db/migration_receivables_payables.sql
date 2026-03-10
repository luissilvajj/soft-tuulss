-- Migration: Receivables and Payables
-- Description: Adds fields to support partial payments and due dates for Accounts Receivable (transactions) and Accounts Payable (purchases).

-- 1. Add columns to transactions (Accounts Receivable)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS due_date DATE;

-- Update existing paid transactions so amount_paid = amount
UPDATE public.transactions SET amount_paid = amount WHERE status = 'paid' AND type = 'sale';

-- 2. Add columns to purchases (Accounts Payable)
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS due_date DATE;

-- Update existing paid purchases so amount_paid = total
UPDATE public.purchases SET amount_paid = total WHERE status = 'paid';

-- 3. Create payments table (optional, but good for tracking payment history)
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Morphic relationship to either a transaction or a purchase
    reference_type VARCHAR(20) CHECK (reference_type IN ('sale', 'purchase')),
    reference_id UUID NOT NULL, -- The ID of the transaction or purchase
    
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debt_payments_org ON public.debt_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_ref ON public.debt_payments(reference_type, reference_id);

-- Enable RLS
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their org debt payments"
    ON public.debt_payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = debt_payments.organization_id AND om.user_id = auth.uid()
    ));

CREATE POLICY "Staff can insert debt payments"
    ON public.debt_payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = debt_payments.organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'cashier')
    ));
