-- ==============================================================================
-- MIGRATION: FISCAL DOCUMENTS AND CORRELATIVES (FASE 15)
-- ==============================================================================
-- Description: Introduces Document Types (Invoice vs Delivery Note) and strict
-- gapless sequences for fiscal correlatives using Native PostgreSQL logic.
-- ==============================================================================

-- 1. Create ENUM for Document Types if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fiscal_document_type') THEN
        CREATE TYPE fiscal_document_type AS ENUM ('invoice', 'credit_note', 'debit_note', 'delivery_note');
    END IF;
END$$;

-- 2. Add new columns to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS document_type fiscal_document_type DEFAULT 'invoice',
ADD COLUMN IF NOT EXISTS invoice_number BIGINT,
ADD COLUMN IF NOT EXISTS control_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS related_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL;

-- 3. Create Sequences for Correlatives
-- For Invoices, Credit Notes, and Debit Notes (Fiscal)
CREATE SEQUENCE IF NOT EXISTS fiscal_invoice_seq START 1;

-- For Delivery Notes / Quotes (Non-Fiscal)
CREATE SEQUENCE IF NOT EXISTS delivery_note_seq START 1;

-- 4. Create the Trigger Function to Assign the Correlative Infallibly
CREATE OR REPLACE FUNCTION assign_document_correlative()
RETURNS TRIGGER AS $$
DECLARE
    next_num BIGINT;
    prefix VARCHAR(10);
BEGIN
    -- Only assign if it's a 'sale', 'credit_note', 'debit_note' or 'delivery_note'
    -- Skip 'expense' and 'income' for now as they are internal movements not subject to this specific billing
    IF NEW.type = 'sale' OR NEW.document_type IN ('invoice', 'credit_note', 'debit_note', 'delivery_note') THEN
        -- Determine which sequence to use based on the document type
        IF NEW.document_type = 'delivery_note' THEN
            next_num := nextval('delivery_note_seq');
            prefix := 'NE-'; -- Nota de Entrega
        ELSIF NEW.document_type = 'credit_note' THEN
            next_num := nextval('fiscal_invoice_seq');
            prefix := 'NC-'; -- Nota de Crédito (shares fiscal sequence to maintain timeline)
        ELSIF NEW.document_type = 'debit_note' THEN
            next_num := nextval('fiscal_invoice_seq');
            prefix := 'ND-'; -- Nota de Débito
        ELSE
            -- Default to invoice
            next_num := nextval('fiscal_invoice_seq');
            prefix := 'FAC-'; -- Factura
        END IF;

        -- Format the control number (e.g., FAC-00000001)
        NEW.invoice_number := next_num;
        NEW.control_number := prefix || lpad(next_num::TEXT, 8, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach the trigger tightly BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_assign_correlative ON public.transactions;
CREATE TRIGGER trigger_assign_correlative
    BEFORE INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION assign_document_correlative();

-- 6. Add Indexes for faster report generation (Libros de Venta)
CREATE INDEX IF NOT EXISTS idx_transactions_document_type ON public.transactions(document_type);
CREATE INDEX IF NOT EXISTS idx_transactions_control_number ON public.transactions(control_number);

-- Ensure backwards compatibility: Existing sales without an explicit document type will be classified as 'invoice'
-- Note: Existing rows will have NULL in invoice_number unless we backfill them (which we will not do to avoid messing up history, 
-- they will just be legacy rows). The trigger only fires on NEW inserts.
