-- Migration: SENIAT Audit & Z Reports
-- Description: Adds 'seniat_auditor' role and the fiscal_z_reports table for Providencia 0121 compliance.

-- 1. Ensure 'seniat_auditor' is supported in application logic (if using text-based roles)
-- If your 'organization_members' table uses an ENUM for roles, you might need to alter it:
-- ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'seniat_auditor';
-- Assuming it's a standard text column or an enum that we can safely target.

-- 2. Create the Fiscal Z Reports table
CREATE TABLE IF NOT EXISTS public.fiscal_z_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id), -- The cashier/admin who ran the Z report
    
    closing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    z_correlative_number INTEGER NOT NULL, -- Sequential number required by SENIAT
    
    -- Totals (USD/Foreign Currency base, or Base Currency of the system)
    total_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_exempt NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_base_general NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_base_reduced NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tax_general NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tax_reduced NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_igtf NUMERIC(15, 2) NOT NULL DEFAULT 0,
    
    -- Exchange rate at the moment of closing (for reference)
    exchange_rate NUMERIC(15, 4) NOT NULL DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure only one Z report per organization per day (usually true, though some places do multiple shifts)
    -- We'll allow multiple but require unique correlatives
    UNIQUE(organization_id, z_correlative_number)
);

-- Enable RLS
ALTER TABLE public.fiscal_z_reports ENABLE ROW LEVEL SECURITY;

-- Policies for fiscal_z_reports

-- Policy: Users can view Z reports of their organization
CREATE POLICY "Users can view Z reports" 
    ON public.fiscal_z_reports FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = fiscal_z_reports.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Policy: Only Admins/Owners/Cashiers can create Z reports
CREATE POLICY "Authorized users can create Z reports" 
    ON public.fiscal_z_reports FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = fiscal_z_reports.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'cashier') -- seniat_auditor CANNOT create
        )
    );

-- Policy: NO ONE can update or delete a Z report once created (Immutability required by law)
-- (Implicitly denied by not having UPDATE/DELETE policies)


-- 3. Adjust existing policies for 'seniat_auditor' if necessary
-- They should have SELECT access to products, transactions, transaction_items, clients, etc.
-- This is already covered typically by policies checking for `EXISTS (SELECT 1 FROM organization_members...)` 
-- without filtering by specific roles.

-- However, we must ensure they CANNOT INSERT/UPDATE/DELETE.
-- Review existing policies on `transactions`, `products`, etc., to ensure they require 
-- role IN ('owner', 'admin', 'cashier') for write operations if they currently just check membership.

-- Example: If transactions has a generic INSERT policy, it should be restricted:
-- (Assuming we need to modify it, providing a placeholder for the logic)
/*
DROP POLICY IF EXISTS "Users can insert transactions" ON public.transactions;
CREATE POLICY "Authorized users can insert transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = transactions.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'cashier')
        )
    );
*/
