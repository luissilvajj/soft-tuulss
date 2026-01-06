
-- 1. FIX Organization Members RLS
-- This is critical for the App to load the user's organization.

alter table public.organization_members enable row level security;

-- Drop existing policies to be safe (names might vary, this clears common ones)
drop policy if exists "Users can view own membership" on public.organization_members;
drop policy if exists "Users can view members of their organizations" on public.organization_members;
drop policy if exists "read_own_membership" on public.organization_members;

-- Allow users to see their OWN membership rows. 
-- This allows: supabase.from('organization_members').select('*').eq('user_id', user.id)
create policy "Users can view own membership" on public.organization_members
  for select using (user_id = auth.uid());

-- 2. FIX Organizations RLS
alter table public.organizations enable row level security;

drop policy if exists "Users can view their organizations" on public.organizations;
drop policy if exists "read_own_organizations" on public.organizations;

-- Allow users to see the organization details IF they are a member
create policy "Users can view their organizations" on public.organizations
  for select using (
    id in (
       select organization_id 
       from public.organization_members 
       where user_id = auth.uid()
    )
  );

-- 3. Verify Helper Function (Optional but good for other queries)
create or replace function get_auth_org_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid()
$$;
