-- 1. FIX RLS (Row Level Security)
alter table public.organization_members enable row level security;

drop policy if exists "Users can view own membership" on public.organization_members;
drop policy if exists "Users can view members of their organizations" on public.organization_members;
drop policy if exists "read_own_membership" on public.organization_members;

create policy "Users can view own membership" on public.organization_members
  for select using (user_id = auth.uid());

alter table public.organizations enable row level security;

drop policy if exists "Users can view their organizations" on public.organizations;
drop policy if exists "read_own_organizations" on public.organizations;

create policy "Users can view their organizations" on public.organizations
  for select using (
    id in (
       select organization_id 
       from public.organization_members 
       where user_id = auth.uid()
    )
  );

-- 2. CREATE FALLBACK RPC FUNCTION (High Priority)
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

grant execute on function public.get_my_main_organization to authenticated;
