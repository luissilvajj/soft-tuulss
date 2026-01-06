-- 1. Wipe all organizations (Cascade checks will handle details, typically)
-- WARNING: This deletes EVERYTHING.
TRUNCATE TABLE public.organizations CASCADE;

-- 2. Create the clean organization for Luis
WITH new_org AS (
    INSERT INTO public.organizations (name, subscription_status, subscription_plan)
    VALUES ('Luis Inc', 'active', 'pro')
    RETURNING id
)
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    new_org.id, 
    auth.users.id, 
    'owner'
FROM auth.users, new_org
WHERE auth.users.email = 'luisxsilva56@gmail.com';
