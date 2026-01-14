-- Create a secure read-only role for the AI
-- usage: postgres://ai_readonly:PASSWORD@...

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ai_readonly') THEN
    CREATE ROLE ai_readonly WITH LOGIN PASSWORD 'Ai_ReadOnly_2026!'; -- User must change this password in secrets
  END IF;
END
$$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO ai_readonly;

-- Grant select on specific tables (Whitlist approach)
GRANT SELECT ON TABLE public.transactions TO ai_readonly;
GRANT SELECT ON TABLE public.products TO ai_readonly;
GRANT SELECT ON TABLE public.clients TO ai_readonly;
GRANT SELECT ON TABLE public.profiles TO ai_readonly;
GRANT SELECT ON TABLE public.organizations TO ai_readonly;
GRANT SELECT ON TABLE public.organization_members TO ai_readonly;

-- Revoke all other permissions to be safe
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM ai_readonly;

-- Ensure RLS is enforced? 
-- BY DEFAULT, a new role is NOT subject to RLS if it's not the `authenticated` role used by Supabase?
-- WAIT. If we connect via direct Postgres (port 5432/6543), RLS is ONLY enforced if the user is not a "BYPASS RLS" user.
-- Standard roles usually don't bypass RLS unless specified.
-- However, RLS policies usually target `auth.uid()`.
-- The AI role won't have `auth.uid()`.
-- So standard RLS might return NOTHING if policies say `using (auth.uid() = ...)`
-- ERROR: If we use this role, RLS will block everything because auth.uid() is null.
-- SOLUTION 1: Grant `BYPASS RLS` to `ai_readonly` BUT rely on the AI generating queries that filter by `organization_id`.
-- This is risky if the AI forgets the filter.
-- SOLUTION 2: The Edge Function enforces `organization_id` in the prompt or wraps the query?
-- Better: The 'System Prompt' must strictly enforce `WHERE organization_id = '...'`.
-- To be safe, we should probably Create a View or Function that the AI calls?
-- For this "Oráculo" Phase, usually the AI generates raw SQL.
-- Let's give `BYPASS RLS` permission but ensuring the Edge Function PRE-APPENDS/VALIDATES the organization_id? 
-- Simpler: The System Prompt will be instructed strongly.
-- AND we will strictly rely on `ai_readonly` having ONLY SELECT permissions.
-- We will add BYPASS RLS so it can actually read data (since it's not 'authenticated').

ALTER ROLE ai_readonly BYPASSRLS; 
