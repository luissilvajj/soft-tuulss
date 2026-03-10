-- Optional: Initialize Kardex with current active stock (Day Zero Baseline)
-- Run this ONCE manually strictly AFTER creating the table and triggers.

INSERT INTO public.inventory_ledger (
    organization_id,
    product_id,
    product_name_at_time,
    previous_stock,
    new_stock,
    quantity_changed,
    change_reason,
    user_id
)
SELECT 
    organization_id,
    id,
    name,
    0, -- Assumption: Before today it was "untracked"
    stock,
    stock,
    'system_initialization',
    NULL -- System action
FROM public.products
WHERE stock > 0 AND deleted_at IS NULL;
