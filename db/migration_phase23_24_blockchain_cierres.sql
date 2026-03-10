-- =================================================================================
-- Phase 23: Hash Chain Criptográfico sobre Transacciones
-- Phase 24: Cierres Fiscales (Cajas y Turnos)
-- =================================================================================

-- Habilitar pgcrypto para SHA-256
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- HASH CHAIN: Inmutabilidad Criptográfica
-- =============================================

-- Agregar columnas de hash a transacciones
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fiscal_hash TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS prev_fiscal_hash TEXT;

-- Función que calcula el hash SHA-256 encadenado al insertar una factura
CREATE OR REPLACE FUNCTION public.chain_fiscal_hash()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_hash TEXT;
    v_payload TEXT;
BEGIN
    -- Solo encadenar facturas (no ajustes internos)
    IF NEW.type NOT IN ('sale', 'credit_note', 'debit_note') THEN
        RETURN NEW;
    END IF;

    -- Obtener el hash de la última transacción fiscal de esta organización
    SELECT fiscal_hash INTO v_prev_hash
    FROM transactions
    WHERE organization_id = NEW.organization_id
      AND fiscal_hash IS NOT NULL
      AND id != NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Si no hay anterior, usar semilla genesis
    IF v_prev_hash IS NULL THEN
        v_prev_hash := 'GENESIS_SOFTTUULS_' || NEW.organization_id::text;
    END IF;

    -- Construir payload: hash_anterior + datos críticos de la factura
    v_payload := v_prev_hash || '|' ||
                 NEW.id::text || '|' ||
                 NEW.organization_id::text || '|' ||
                 COALESCE(NEW.invoice_number, '') || '|' ||
                 COALESCE(NEW.control_number, '') || '|' ||
                 NEW.amount::text || '|' ||
                 COALESCE(NEW.tax_base::text, '0') || '|' ||
                 NEW.date::text || '|' ||
                 NEW.type;

    -- Calcular SHA-256
    NEW.fiscal_hash := encode(digest(v_payload, 'sha256'), 'hex');
    NEW.prev_fiscal_hash := v_prev_hash;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: se ejecuta ANTES de insertar una transacción nueva
DROP TRIGGER IF EXISTS trigger_chain_hash ON transactions;
CREATE TRIGGER trigger_chain_hash
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.chain_fiscal_hash();

-- =============================================
-- CIERRES FISCALES: Cajas y Turnos
-- =============================================

-- Tabla de Cajas Registradoras
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Caja Principal',
    location VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_registers_org ON cash_registers(organization_id);
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cash_registers_org_access" ON cash_registers;
CREATE POLICY "cash_registers_org_access" ON cash_registers
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )) WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));

-- Tabla de Sesiones/Turnos de Caja
CREATE TABLE IF NOT EXISTS public.cash_register_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cash_register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    opened_by UUID REFERENCES auth.users(id),
    closed_by UUID REFERENCES auth.users(id),
    
    -- Montos
    opening_amount DECIMAL(15,2) NOT NULL DEFAULT 0, -- Fondo de caja inicial
    expected_amount DECIMAL(15,2) DEFAULT 0,         -- Calculado automáticamente de ventas
    declared_amount DECIMAL(15,2),                   -- Lo que el cajero dice que tiene
    difference DECIMAL(15,2),                        -- declared - expected (faltante/sobrante)
    adjustment_note TEXT,                             -- Justificación si hay diferencia
    
    -- Estado
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Reporte Z resumen
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_sales_count INTEGER DEFAULT 0,
    total_cash DECIMAL(15,2) DEFAULT 0,
    total_card DECIMAL(15,2) DEFAULT 0,
    total_transfer DECIMAL(15,2) DEFAULT 0,
    total_mobile_pay DECIMAL(15,2) DEFAULT 0,
    total_zelle DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_org ON cash_register_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_register ON cash_register_sessions(cash_register_id);
ALTER TABLE cash_register_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cash_sessions_org_access" ON cash_register_sessions;
CREATE POLICY "cash_sessions_org_access" ON cash_register_sessions
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )) WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));
