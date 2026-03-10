-- Migration: Purchases Module
-- Description: Creates suppliers and purchases tables for managing vendor invoices and the Purchase Ledger.

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    rif VARCHAR(20),
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    
    invoice_number VARCHAR(50),          -- Factura del proveedor
    control_number VARCHAR(50),          -- Control del proveedor
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Amounts
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    exempt_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_base NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,  -- IVA cargado por proveedor
    igtf_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    
    currency VARCHAR(5) DEFAULT 'USD',
    exchange_rate NUMERIC(15, 4) DEFAULT 1,
    
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'partial')),
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON public.suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchases_org ON public.purchases(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON public.purchases(supplier_id);

-- 4. Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Suppliers
CREATE POLICY "Users can view their org suppliers"
    ON public.suppliers FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = suppliers.organization_id AND om.user_id = auth.uid()
    ));

CREATE POLICY "Staff can manage suppliers"
    ON public.suppliers FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = suppliers.organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    ));

-- 6. RLS Policies for Purchases
CREATE POLICY "Users can view their org purchases"
    ON public.purchases FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = purchases.organization_id AND om.user_id = auth.uid()
    ));

CREATE POLICY "Staff can manage purchases"
    ON public.purchases FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = purchases.organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    ));
