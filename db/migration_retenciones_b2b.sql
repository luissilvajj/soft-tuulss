-- =================================================================================
-- Softtuuls POS - Migration: Retenciones B2B (Contribuyentes Especiales)
-- =================================================================================

-- 1. Actualizar tabla Clientes para soportar B2B / Contribuyentes Especiales
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_special_taxpayer BOOLEAN DEFAULT false;

-- 2. Crear Tabla de Retenciones Fiscales (Comprobantes recibidos)
CREATE TABLE IF NOT EXISTS fiscal_retentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    retention_number VARCHAR(50) NOT NULL, -- Numero de Comprobante de Retención (ej. 2024050000012)
    percentage DECIMAL(5,2) NOT NULL DEFAULT 75.00, -- 75% o 100% generalmente en Venezuela
    amount_retained DECIMAL(15,2) NOT NULL, -- Monto exacto descontado del pago
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restriccion: 1 retencion por documento para evitar duplicidades accidentales
    UNIQUE(transaction_id)
);

-- Indexing para cruce rapido de reportes
CREATE INDEX IF NOT EXISTS idx_fiscal_retentions_org_id ON fiscal_retentions(organization_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_retentions_tx_id ON fiscal_retentions(transaction_id);

-- 3. Habilitar y Configurar Row Level Security (RLS)
ALTER TABLE fiscal_retentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View retentions within organization" ON fiscal_retentions
    FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Insert retentions" ON fiscal_retentions
    FOR INSERT 
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    ));

-- Note: No deletes on fiscal retentions, they are legal documents.
-- If someone makes a mistake, they should technically emit a counter-document or void the parent transaction.
