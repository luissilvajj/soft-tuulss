-- MIGRATION: Inventory Kardex (Audit Log)
-- Phase: Enterprise Features (ERP Level Audit)

-- 1. Create the Audit Log Table (Kardex)
CREATE TABLE public.inventory_ledger (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    product_name_at_time text NOT NULL, -- Snapshot of the name
    previous_stock integer NOT NULL,
    new_stock integer NOT NULL,
    quantity_changed integer NOT NULL,
    change_reason text DEFAULT 'manual_adjustment', -- 'sale', 'restock', 'correction', 'system_trigger'
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for the Ledger
-- Users can view the Kardex of their own organization
CREATE POLICY "Users can view inventory ledger of their org" ON public.inventory_ledger
    FOR SELECT USING (organization_id IN (SELECT get_auth_org_ids()));

-- The ledger is APPEND-ONLY and system managed. Users should theoretically not insert/update directly.
-- However, we must allow the trigger to insert. Triggers run as the user by default (invoker).
-- Security Definer on the trigger handles this, so we can lock down direct API access:
CREATE POLICY "Deny direct inserts to ledger via API" ON public.inventory_ledger
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Deny all updates to ledger" ON public.inventory_ledger
    FOR UPDATE USING (false);

CREATE POLICY "Deny all deletes to ledger" ON public.inventory_ledger
    FOR DELETE USING (false);


-- 4. Create the Trigger Function
CREATE OR REPLACE FUNCTION log_inventory_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass the strict insert policy
AS $$
DECLARE
    v_reason text;
    v_user_id uuid;
BEGIN
    -- Only log if the stock actually changed
    IF NEW.stock IS DISTINCT FROM OLD.stock THEN
        
        -- Try to deduce context/reason from application logic if possible
        -- In a fully event-driven app, the backend passes this. For triggers, we infer:
        IF NEW.stock < OLD.stock THEN
            v_reason := 'sale_or_decrement';
        ELSIF NEW.stock > OLD.stock THEN
            v_reason := 'restock_or_increment';
        ELSE
            v_reason := 'adjustment';
        END IF;

        -- Capture who did it, if possible. For RLS contexts, auth.uid() is available.
        -- If triggered by an external cron/service role without auth context, it will be null.
        v_user_id := auth.uid();

        -- Insert the immutable log record (Bypasses RLS due to SECURITY DEFINER)
        INSERT INTO public.inventory_ledger (
            organization_id,
            product_id,
            product_name_at_time,
            previous_stock,
            new_stock,
            quantity_changed,
            change_reason,
            user_id
        ) VALUES (
            NEW.organization_id,
            NEW.id,
            NEW.name,
            OLD.stock,
            NEW.stock,
            NEW.stock - OLD.stock,
            v_reason,
            v_user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. Attach the Trigger to the Products Table
-- We only want this to fire on UPDATE statements where the stock changes.
DROP TRIGGER IF EXISTS audit_stock_changes ON public.products;
CREATE TRIGGER audit_stock_changes
    AFTER UPDATE OF stock ON public.products
    FOR EACH ROW
    EXECUTE PROCEDURE log_inventory_changes();

-- Optional: Initial Seed for existing product stock?
-- Usually Kardex starts calculating differentials from the moment it is implemented.
-- To establish base lines, you could theoretically INSERT a starting ledger row for all > 0 stock, 
-- but the exact moment of migration acts as "Day Zero".
