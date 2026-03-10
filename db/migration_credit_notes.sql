-- MIGRATION: Phase 16 - Notas de Crédito y Reversiones

-- Función para incrementar stock de forma atómica al anular facturas
CREATE OR REPLACE FUNCTION increment_stock(p_id uuid, q integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar el inventario de manera segura bloqueando la fila
  UPDATE public.products 
  SET stock = stock + q 
  WHERE id = p_id;
  
  RETURN true;
END;
$$;
