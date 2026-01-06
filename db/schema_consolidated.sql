-- SOFTTUULS CONSOLIDATED SCHEMA
-- Generated: 2026-01-06
-- Includes: Base Schema + RLS Security Fixes

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ORGANIZATIONS
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  logo_url text,
  subscription_status text default 'active' check (subscription_status in ('active', 'inactive', 'past_due')),
  subscription_plan text default 'basic'
);

-- 2. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
  -- Note: is_super_admin to be added via migration
);

-- 3. ORGANIZATION MEMBERS
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- 4. PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  name text not null,
  sku text,
  price numeric(10,2) default 0,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CLIENTS
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  name text not null,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TRANSACTIONS
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  type text not null check (type in ('sale', 'expense', 'adjustment')),
  amount numeric(10,2) not null default 0,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TRANSACTION ITEMS
create table public.transaction_items (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  transaction_id uuid references public.transactions on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price_at_transaction numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.products enable row level security;
alter table public.clients enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;

-- HELPER FUNCTION FOR RLS
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

-- RLS POLICIES (Consolidated & Secured)

-- PROFILES
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ORGANIZATIONS
create policy "Users can view their organizations" on public.organizations
  for select using (id in (select get_auth_org_ids()));

-- ORGANIZATION MEMBERS
create policy "Users can view own membership" on public.organization_members
  for select using (user_id = auth.uid());
create policy "Users can view members of their organizations" on public.organization_members
  for select using (organization_id in (select get_auth_org_ids()));

-- SECURITY CRITICAL: Deny direct inserts
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.organization_members;
CREATE POLICY "Deny all direct inserts" ON public.organization_members FOR INSERT WITH CHECK (false);

-- PRODUCTS
create policy "Users can view products of their organization" on public.products
  for all using (organization_id in (select get_auth_org_ids()));

-- CLIENTS
create policy "Users can view clients of their organization" on public.clients
  for all using (organization_id in (select get_auth_org_ids()));

-- TRANSACTIONS
create policy "Users can view transactions of their organization" on public.transactions
  for all using (organization_id in (select get_auth_org_ids()));

-- TRANSACTION ITEMS
create policy "Users can view transaction items of their organization" on public.transaction_items
  for select using (organization_id in (select get_auth_org_ids()));

-- AUTH TRIGGERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Only create trigger if it doesn't exist (idempotent style)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
