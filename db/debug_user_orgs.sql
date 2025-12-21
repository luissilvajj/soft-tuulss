-- Variable for email to search (Case Insensitive)
-- Run this in your Supabase SQL Editor

select 
    au.id as user_id,
    au.email,
    au.last_sign_in_at,
    om.role,
    o.id as org_id,
    o.name as org_name,
    o.subscription_status,
    o.created_at
from auth.users au
left join public.organization_members om on om.user_id = au.id
left join public.organizations o on o.id = om.organization_id
where au.email ILIKE 'LuisXSilva56@gmail.com';
