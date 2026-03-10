-- Migration: Fiscal Audit Trail (Providencia 0121)
-- Description: Creates an immutable log table and PostgreSQL triggers to record critical changes 
-- (like product price/tax modification or invoice cancellation) directly at the database engine level.

-- 1. Create the Immutable Audit Table
CREATE TABLE IF NOT EXISTS public.fiscal_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    
    old_data JSONB,
    new_data JSONB,
    
    changed_by UUID REFERENCES auth.users(id), -- Null if system or outside auth block
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster querying by auditors
CREATE INDEX IF NOT EXISTS idx_fiscal_audit_logs_org ON public.fiscal_audit_logs(organization_id, table_name, record_id, created_at);

-- Enable RLS
ALTER TABLE public.fiscal_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. EXTREME Policies (Inviolable Constraint)
-- No application user can manually insert, update, or delete. 
-- Only the DB Engine (Triggers operating under postgres/superuser role) can insert.

-- Allow Auditor and Admins to READ (SELECT)
CREATE POLICY "Auditors and Admins can view audit logs" 
    ON public.fiscal_audit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = fiscal_audit_logs.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'seniat_auditor')
        )
    );

-- Explicitly block all other operations (No INSERT/UPDATE/DELETE policies created for public)

-- 3. The Core Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_fiscal_action()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_org_id UUID;
BEGIN
    -- Determine operation type and capture data
    IF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Special rule: Only log if critical fiscal fields actually changed (Optimization)
        -- For products, we care about price and tax changes
        IF TG_TABLE_NAME = 'products' THEN
            IF (OLD.price = NEW.price AND OLD.tax_condition = NEW.tax_condition) THEN
                RETURN NEW; -- Skip log if purely cosmetic change (like name/description)
            END IF;
            v_org_id := NEW.organization_id;
        ELSIF TG_TABLE_NAME = 'transactions' THEN
             IF (OLD.status = NEW.status) THEN
                RETURN NEW;
            END IF;
            v_org_id := NEW.organization_id;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        v_org_id := OLD.organization_id;
    END IF;

    -- Insert into the log table bypassing RLS (Triggers run as invoker by default, but we can trust PostgreSQL here since it's an internal call)
    INSERT INTO public.fiscal_audit_logs (
        organization_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
    ) VALUES (
        v_org_id,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_old_data,
        v_new_data,
        auth.uid() -- Automatically gets the Supabase user if called via API
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER ensures it runs with permissions to insert into fiscal_audit_logs

-- 4. Attach Triggers to Critical Tables

-- Trigger for Products (Fired AFTER UPDATE)
DROP TRIGGER IF EXISTS trigger_audit_products ON public.products;
CREATE TRIGGER trigger_audit_products
    AFTER UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.log_fiscal_action();

-- Trigger for Transactions (Fired AFTER UPDATE or DELETE) 
-- Used to track when a transaction is 'cancelled' or voided (Providencia 0121 requires void receipt logic)
DROP TRIGGER IF EXISTS trigger_audit_transactions ON public.transactions;
CREATE TRIGGER trigger_audit_transactions
    AFTER UPDATE OR DELETE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_fiscal_action();
