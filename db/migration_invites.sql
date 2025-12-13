-- Create Pending Invites Table
create table if not exists public.pending_invites (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text default 'member',
  created_at timestamptz default now(),
  invited_by uuid references auth.users(id),
  unique(organization_id, email)
);

-- Enable RLS
alter table public.pending_invites enable row level security;

-- Policy: Organization admins/owners can view/create invites for their org
create policy "Admins can view pending invites"
  on public.pending_invites for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = public.pending_invites.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

create policy "Admins can insert pending invites"
  on public.pending_invites for insert
  with check (
    exists (
      select 1 from public.organization_members
      where organization_id = public.pending_invites.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );
  
-- Policy: Users can view invites sent TO THEM (by email) -> Needed for claiming? 
-- Actually, claim function is SECURITY DEFINER, so we don't strictly need this for the claiming process,
-- but good for debugging if we ever list them properly.
create policy "Users can view their own invites"
  on public.pending_invites for select
  using ( email = auth.jwt() ->> 'email' );


-- Update add_team_member to handle pending invites
create or replace function public.add_team_member(
  p_org_id uuid,
  p_email text,
  p_role text default 'member'
)
returns text
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_requester_role text;
begin
  -- 1. SECURITY CHECK
  select role into v_requester_role
  from public.organization_members
  where organization_id = p_org_id
  and user_id = auth.uid();

  if v_requester_role is null or v_requester_role not in ('owner', 'admin') then
    raise exception 'No tienes permisos.';
  end if;

  -- 2. LOOKUP USER
  select id into v_user_id from auth.users where email = p_email;

  if v_user_id is not null then
    -- User EXISTS: Add directly
    insert into public.organization_members (organization_id, user_id, role)
    values (p_org_id, v_user_id, p_role)
    on conflict (organization_id, user_id) do update set role = p_role;
    return 'Usuario agregado exitosamente.';
  else
    -- User DOES NOT EXIST: Add to pending
    insert into public.pending_invites (organization_id, email, role, invited_by)
    values (p_org_id, p_email, p_role, auth.uid())
    on conflict (organization_id, email) do update set role = p_role;
    
    return 'Usuario no registrado. Invitación enviada (Pendiente).';
  end if;
end;
$$;


-- Function to Claim Invites (Run on Onboarding)
create or replace function public.claim_invites()
returns void
language plpgsql
security definer
as $$
declare
  v_email text;
  v_count int;
begin
  -- Get current user email
  select email into v_email from auth.users where id = auth.uid();
  
  if v_email is null then
     return;
  end if;

  -- Insert from pending to real members
  insert into public.organization_members (organization_id, user_id, role)
  select organization_id, auth.uid(), role
  from public.pending_invites
  where email = v_email
  on conflict (organization_id, user_id) do nothing;

  -- Delete processed invites
  delete from public.pending_invites where email = v_email;
end;
$$;
