-- Create table for tracking daily exchange rates
CREATE TABLE public.exchange_rates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  rate numeric(10,4) NOT NULL,
  currency_from text NOT NULL DEFAULT 'USD',
  currency_to text NOT NULL DEFAULT 'VES',
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, date, currency_from, currency_to)
);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see rates for their organization
CREATE POLICY "Users can view rates of their organization" ON public.exchange_rates
  FOR SELECT USING (organization_id IN (SELECT get_auth_org_ids()));

-- Policy: Users can insert/update rates for their organization
CREATE POLICY "Users can manage rates of their organization" ON public.exchange_rates
  FOR ALL USING (organization_id IN (SELECT get_auth_org_ids()));
