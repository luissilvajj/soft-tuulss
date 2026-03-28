-- ==============================================================================
-- MIGRATION: SENIAT SFE COMPLIANCE EXPANSION (FASE 25)
-- ==============================================================================
-- 1. TAX EXPANSION: LUXURY (31%)
-- 2. SFE DIGITAL FIELDS: CUFE, QR, STATUS, SIGNATURE
-- 3. GAPLESS NUMBERING: LOCKING SYSTEM FOR CORRELATIVES
-- ==============================================================================

-- 1. PRODUCTS & TRANSACTION ITEMS TAX ENUM UPDATE
-- Note: PostgreSQL doesn't allow direct enum update in CHECK constraints without dropping.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_tax_condition_check;
ALTER TABLE public.products ADD CONSTRAINT products_tax_condition_check 
    CHECK (tax_condition IN ('exempt', 'general', 'reduced', 'luxury'));

ALTER TABLE public.transaction_items DROP CONSTRAINT IF EXISTS transaction_items_tax_condition_check;
ALTER TABLE public.transaction_items ADD CONSTRAINT transaction_items_tax_condition_check 
    CHECK (tax_condition IN ('exempt', 'general', 'reduced', 'luxury'));

-- 2. ADD COLUMNS TO TRANSACTIONS
ALTER TABLE public.transactions
-- Luxury Tax Amount
ADD COLUMN IF NOT EXISTS tax_luxury_amount NUMERIC(15,2) DEFAULT 0,
-- SFE Compliance Fields
ADD COLUMN IF NOT EXISTS cufe VARCHAR(255),
ADD COLUMN IF NOT EXISTS sfe_qr_code TEXT,
ADD COLUMN IF NOT EXISTS sfe_status VARCHAR(20) DEFAULT 'local' CHECK (sfe_status IN ('local', 'pending', 'synced', 'rejected')),
ADD COLUMN IF NOT EXISTS sfe_signature TEXT,
ADD COLUMN IF NOT EXISTS sfe_error_log JSONB;

-- 3. GAPLESS NUMBERING SYSTEM (LOCKING TABLE)
-- Separate table to hold the next value and lock it during transaction
CREATE TABLE IF NOT EXISTS public.fiscal_sequences (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'invoice', 'delivery_note', etc.
    prefix VARCHAR(10),
    current_value BIGINT DEFAULT 0,
    PRIMARY KEY (organization_id, document_type)
);

-- Seed existing organizations if needed (optional, trigger will handle missing rows)
-- We will implement the trigger to find or create the sequence row on demand.

-- 4. REFACTOR CORRELATIVE TRIGGER (THE CORE OF GAPLESS COMPLIANCE)
CREATE OR REPLACE FUNCTION public.assign_document_correlative()
RETURNS TRIGGER AS $$
DECLARE
    v_seq_row RECORD;
    v_prefix VARCHAR(10);
    v_next_val BIGINT;
BEGIN
    -- Only assign if it's a 'sale', 'credit_note', 'debit_note' or 'delivery_note'
    IF NEW.type = 'sale' OR NEW.document_type IN ('invoice', 'credit_note', 'debit_note', 'delivery_note') THEN
        
        -- Determine Prefix and Type identifier
        IF NEW.document_type = 'delivery_note' THEN
            v_prefix := 'NE-'; -- Nota de Entrega
        ELSIF NEW.document_type = 'credit_note' THEN
            v_prefix := 'NC-'; -- Nota de Crédito
        ELSIF NEW.document_type = 'debit_note' THEN
            v_prefix := 'ND-'; -- Nota de Débito
        ELSE
            v_prefix := 'FAC-'; -- Factura (Default)
        END IF;

        -- LOCK the sequence row for this organization and document type
        -- This prevents concurrent transactions from getting the same number!
        -- If the row doesn't exist, we'll initialize it.
        
        -- 1. Try to find and LOCK
        SELECT * INTO v_seq_row 
        FROM public.fiscal_sequences 
        WHERE organization_id = NEW.organization_id 
          AND document_type = NEW.document_type
        FOR UPDATE;

        -- 2. Initialize if missing
        IF NOT FOUND THEN
            -- We might get the current max from transactions to avoid duplication in case of legacy data
            -- If the sequence is shared (FAC/NC/ND) we should check all relevant types
            -- Here we assume document_type is specific
            SELECT COALESCE(MAX(invoice_number), 0) INTO v_next_val 
            FROM public.transactions 
            WHERE organization_id = NEW.organization_id 
              AND document_type = NEW.document_type;

            v_next_val := v_next_val + 1;
            
            INSERT INTO public.fiscal_sequences (organization_id, document_type, prefix, current_value)
            VALUES (NEW.organization_id, NEW.document_type, v_prefix, v_next_val)
            RETURNING current_value INTO v_next_val;
        ELSE
            -- 3. Increment
            v_next_val := v_seq_row.current_value + 1;
            UPDATE public.fiscal_sequences 
            SET current_value = v_next_val
            WHERE organization_id = NEW.organization_id 
              AND document_type = NEW.document_type;
        END IF;

        -- Format the control number (e.g., FAC-00000001)
        NEW.invoice_number := v_next_val;
        NEW.control_number := v_prefix || lpad(v_next_val::TEXT, 8, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS trigger_assign_correlative ON public.transactions;
CREATE TRIGGER trigger_assign_correlative
    BEFORE INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_document_correlative();
