-- Audit Logs Table
create table if not exists public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references public.organizations on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Policies
-- 1. Members can INSERT logs (triggered by their actions)
create policy "Members can insert logs" on public.audit_logs
    for insert with check (organization_id in (select get_auth_org_ids()));

-- 2. Only Admins/Owners can VIEW logs
create policy "Admins can view logs" on public.audit_logs
    for select using (
        organization_id in (
            select organization_id 
            from public.organization_members 
            where user_id = auth.uid() 
            and role in ('owner', 'admin')
        )
    );
