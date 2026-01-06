-- Remote Procedure Call (RPC) to atomically decrement stock
-- usage: supabase.rpc('decrement_stock', { p_id: 'uuid', q: 1 })

create or replace function decrement_stock(p_id uuid, q integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock = stock - q
  where id = p_id;
end;
$$;
