-- Create table for storing manual payment reports
create table if not exists payment_reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  organization_id uuid references organizations(id),
  amount numeric not null,
  currency text default 'VES',
  reference_number text not null,
  payment_date date not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  plan_type text -- 'pro', 'enterprise'
);

-- Enable RLS
alter table payment_reports enable row level security;

-- Allow users to insert their own reports
create policy "Users can insert their own payment reports"
on payment_reports for insert
with check (auth.uid() = user_id);

-- Allow users to view their own reports
create policy "Users can view their own payment reports"
on payment_reports for select
using (auth.uid() = user_id);