-- Migration: Exchange Differential (Diferencial Cambiario)
-- Description: Adds columns to track BS variations when paying USD debts at a higher/lower BCV rate than original.

-- 1. Add exchange columns to debt_payments
ALTER TABLE public.debt_payments ADD COLUMN IF NOT EXISTS exchange_rate_used NUMERIC(15, 4);
ALTER TABLE public.debt_payments ADD COLUMN IF NOT EXISTS exchange_diff_bs NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.debt_payments ADD COLUMN IF NOT EXISTS exchange_diff_type VARCHAR(10) CHECK (exchange_diff_type IN ('gain', 'loss', 'none'));

-- In Venezuela, if you sell $100 at 36 Bs ($1 = 36 Bs) = 3,600 Bs
-- Si pagan a la semana, y el $1 = 40 Bs:
-- Venta (CxC): Pagaron $100 * 40 = 4,000 Bs. 
-- Ganancia de 400 Bs.

-- Add the original rate to the debts endpoint if we want to run bulk SQL calculations in the future.
-- Currently, transactions already have exchange_rate. 
-- Purchases also have exchange_rate since migration_purchases.
