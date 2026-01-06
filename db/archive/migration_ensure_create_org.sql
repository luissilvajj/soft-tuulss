-- Ensure create_org_for_user exists
create or replace function public.create_org_for_user(org_name text)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
begin
  insert into public.organizations (name) values (org_name) returning id into new_org_id;
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');
  return new_org_id;
end;
$$;

grant execute on function public.create_org_for_user to authenticated;
