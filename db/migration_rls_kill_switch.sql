-- =========================================================================================
-- SUBSCRIPTION KILL SWITCH (RLS)
-- Esta política actúa como última línea de defensa (Backend). 
-- Previene que CUALQUIER USUARIO inserte transacciones (ej. ventas, facturaciones, inventario) 
-- si el estado de suscripción de la organización a la que pertenecen es inválido o moroso final.
-- =========================================================================================

-- Reemplaza 'transactions' por la tabla que deseas asegurar (ej: sales, invoice, etc.)
-- Asumimos que la tabla de transacciones tiene la FK 'organization_id'.

-- 1. Función utilitaria: Verifica el estado de la suscripción (usado por las políticas)
-- El estatus debe ser 'active' o 'trialing'. Si es 'past_due' con una fecha menor
-- a X días, es gracia. Por seguridad estricta, la BD confía en que el Job del Backend actuará.
-- Para simplificar el RLS (baja latencia), asumimos:
-- "Si no es 'active', 'trialing' o 'past_due', BLOQUEAR".

CREATE OR REPLACE FUNCTION is_org_subscription_valid(org_uuid uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- (Válido aquí porque los usuarios regulares NO deben ver los estados/pagos de la org que no es suya directamente en RLS deep, pero RLS general es Invoker)
AS $$
DECLARE
    v_status text;
    v_last_failure timestamptz;
BEGIN
    SELECT subscription_status, last_payment_failure 
    INTO v_status, v_last_failure
    FROM public.organizations 
    WHERE id = org_uuid;

    -- Validaciones
    IF v_status IN ('active', 'trialing') THEN
        RETURN TRUE;
    ELSIF v_status = 'past_due' THEN
        -- Permitimos gracia de 5 días máximo desde el server (Aproximado)
        IF v_last_failure IS NULL OR (EXTRACT(EPOCH FROM (now() - v_last_failure)) / 86400) <= 5 THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- ('canceled', 'unpaid', 'incomplete', o past_due muy viejo)
    RETURN FALSE;
END;
$$;

-- 2. Aseguramos RLS sobre TRANSACTIONS (Solo inserciones/Actualizaciones, para que puedan LEER el pasado histórico)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Impedir crear NUEVAS ventas si se acabó la suscripción
DROP POLICY IF EXISTS "Suscripción activa requerida para INSERTAR transacciones" ON public.transactions;
CREATE POLICY "Suscripción activa requerida para INSERTAR transacciones"
ON public.transactions
FOR INSERT
WITH CHECK (
    is_org_subscription_valid(organization_id) = TRUE
);

-- Impedir Actualizar ventas pasadas (mutación general) si se acabó la suscripción
DROP POLICY IF EXISTS "Suscripción activa requerida para ACTUALIZAR transacciones" ON public.transactions;
CREATE POLICY "Suscripción activa requerida para ACTUALIZAR transacciones"
ON public.transactions
FOR UPDATE
USING (
    is_org_subscription_valid(organization_id) = TRUE
)
WITH CHECK (
    is_org_subscription_valid(organization_id) = TRUE
);

-- (Las reglas SELECT deben seguir siendo las nativas: "El usuario debe pertenecer a la ORG")
-- Permitimos que los usuarios Sigan VIENDO su dashboard e historial, simplemente no pueden Operar.
