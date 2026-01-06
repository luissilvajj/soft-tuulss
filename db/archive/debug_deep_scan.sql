-- DEEP SCAN: Unified Report
-- Run this to get a SINGLE JSON result with all your data stats.

SELECT json_build_object(
    'total_auth_users', (SELECT count(*) FROM auth.users),
    'organizations_table', (
        SELECT json_build_object(
            'total_rows', (SELECT count(*) FROM public.organizations),
            'rls_enabled', (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.organizations'::regclass),
            'columns', (SELECT json_agg(column_name) FROM information_schema.columns WHERE table_name = 'organizations'),
            'sample_data', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM public.organizations LIMIT 3) t)
        )
    ),
    'members_table', (
        SELECT json_build_object(
            'total_rows', (SELECT count(*) FROM public.organization_members),
            'columns', (SELECT json_agg(column_name) FROM information_schema.columns WHERE table_name = 'organization_members'),
            'sample_data', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM public.organization_members LIMIT 3) t)
        )
    )
);
