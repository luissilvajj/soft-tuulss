
-- EMERGENCY ACCESS FIX
-- This function allows the user to read their own organization data 
-- BYPASSING all Row Level Security (RLS) policies safely.
-- It runs with "Security Definer" privileges (System Level).

create or replace function public.get_my_main_organization()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    result json;
begin
    -- Try to find the first organization the user is a member of
    select row_to_json(t) into result
    from (
        select 
            o.id,
            o.name,
            o.logo_url,
            o.subscription_status,
            o.subscription_plan,
            o.trial_ends_at,
            o.current_period_end,
            o.stripe_customer_id,
            m.role
        from organization_members m
        join organizations o on m.organization_id = o.id
        where m.user_id = auth.uid() 
        limit 1
    ) t;

    return result;
end;
$$;

-- Grant access to authenticated users
grant execute on function public.get_my_main_organization to authenticated;
