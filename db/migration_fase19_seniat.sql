-- =================================================================================
-- Fase 19: Retenciones de ISLR (Servicios vs Bienes)
-- =================================================================================

-- 1. Ampliar Fiscal Retentions para soportar IVA e ISLR
-- Add type column. Soft defaults to 'iva' for backward compatibility
ALTER TABLE fiscal_retentions 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'iva' CHECK (type IN ('iva', 'islr'));

-- Remover la restriccion UNIQUE(transaction_id) estrictamente, 
-- ya que una factura de servicios puede tener TANTO retención de IVA como retencion de ISLR simultaneamente.
ALTER TABLE fiscal_retentions DROP CONSTRAINT IF EXISTS fiscal_retentions_transaction_id_key;

-- Nueva restriccion: Maximo 1 retencion de CADA TIPO por transaccion
ALTER TABLE fiscal_retentions ADD CONSTRAINT unique_retention_type_per_tx UNIQUE (transaction_id, type);

-- 2. Actualizar Politica de RLS de Upsert
DROP POLICY IF EXISTS "Insert retentions" ON fiscal_retentions;
CREATE POLICY "Insert or Update retentions" ON fiscal_retentions
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));
