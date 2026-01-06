/*
  FUNCTION: add_team_member
  DESCRIPTION: Adds a user to an organization by their email address.
  
  NOTES:
  - This function is SECURITY DEFINER, meaning it runs with the privileges of the creator (postgres).
  - This allows us to look up the 'id' from 'auth.users' using the email, which normal users cannot do.
  - IMPORTANT: It includes a check to ensure the EXECUTING user is actually an 'owner' or 'admin' of the target organization.
*/

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
  -- 1. SECURITY CHECK: Ensure the person calling this function is an Admin/Owner of the Org
  select role into v_requester_role
  from public.organization_members
  where organization_id = p_org_id
  and user_id = auth.uid();

  if v_requester_role is null or v_requester_role not in ('owner', 'admin') then
    raise exception 'No tienes permisos para agregar miembros a esta organización.';
  end if;

  -- 2. LOOKUP: Find the user ID by Email
  select id into v_user_id
  from auth.users
  where email = p_email;

  if v_user_id is null then
    -- OPTIONAL: If we wanted to support invites for non-existent users, we'd handle it here
    -- But for MVP, we require the user to have signed up first.
    raise exception 'El usuario con email % no existe. Pídeles que se registren primero en la app.', p_email;
  end if;

  -- 3. INSERT: Add to organization_members
  insert into public.organization_members (organization_id, user_id, role)
  values (p_org_id, v_user_id, p_role)
  on conflict (organization_id, user_id) do update
  set role = p_role; -- Update role if already exists

  return 'Usuario agregado exitosamente.';
end;
$$;
