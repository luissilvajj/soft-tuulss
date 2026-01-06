-- FUNCTION TO REGISTER TRANSACTION AND UPDATE STOCK
create or replace function register_transaction(
  p_organization_id uuid,
  p_type text,
  p_amount numeric,
  p_client_id uuid, -- optional
  p_items jsonb -- Array of {product_id, quantity, price}
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_transaction_id uuid;
  item jsonb;
  v_product_stock int;
begin
  -- 1. Create Transaction
  insert into public.transactions (organization_id, type, amount, client_id)
  values (p_organization_id, p_type, p_amount, p_client_id)
  returning id into v_transaction_id;

  -- 2. Process Items
  for item in select * from jsonb_array_elements(p_items)
  loop
    -- Insert Transaction Item [PERFORMANCE FIX: Include organization_id]
    insert into public.transaction_items (organization_id, transaction_id, product_id, quantity, price_at_transaction)
    values (
      p_organization_id,
      v_transaction_id,
      (item->>'product_id')::uuid,
      (item->>'quantity')::int,
      (item->>'price')::numeric
    );

    -- Update Stock based on type
    if p_type = 'sale' then
      update public.products
      set stock = stock - (item->>'quantity')::int
      where id = (item->>'product_id')::uuid;
    elsif p_type = 'expense' then -- Restock / Purchase
      update public.products
      set stock = stock + (item->>'quantity')::int
      where id = (item->>'product_id')::uuid;
    end if;

    -- Check if stock went negative (optional, dependent on business rules)
    -- select stock into v_product_stock from public.products where id = (item->>'product_id')::uuid;
    -- if v_product_stock < 0 then raise exception 'Stock insuficiente para el producto %', (item->>'product_id'); end if;

  end loop;

  return v_transaction_id;
end;
$$;
