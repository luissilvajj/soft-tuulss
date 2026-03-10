-- =================================================================================
-- Fase 19: Retenciones Fiscales (IVA + ISLR)
-- =================================================================================

-- 1. Crear tabla de Retenciones Fiscales si no existe
CREATE TABLE IF NOT EXISTS fiscal_retentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'iva' CHECK (type IN ('iva', 'islr')),
    retention_number VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    amount_retained DECIMAL(15,2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Máximo 1 retención de CADA TIPO por transacción
    UNIQUE(transaction_id, type)
);

-- 2. Índices para reportes rápidos
CREATE INDEX IF NOT EXISTS idx_fiscal_retentions_org_id ON fiscal_retentions(organization_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_retentions_tx_id ON fiscal_retentions(transaction_id);

-- 3. Habilitar RLS
ALTER TABLE fiscal_retentions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad (drop primero para evitar conflicto)
DROP POLICY IF EXISTS "View retentions within organization" ON fiscal_retentions;
DROP POLICY IF EXISTS "Insert or Update retentions" ON fiscal_retentions;
DROP POLICY IF EXISTS "Insert retentions" ON fiscal_retentions;

CREATE POLICY "View retentions within organization" ON fiscal_retentions
    FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Insert or Update retentions" ON fiscal_retentions
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));

-- 5. Marcar clientes como Contribuyentes Especiales
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_special_taxpayer BOOLEAN DEFAULT false;
