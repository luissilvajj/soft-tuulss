-- SCHEMA X-RAY: Full Analysis Script
-- Run this in Supabase SQL Editor to get a complete picture of your database state.
-- Copy the "Results" and paste them back to the chat or take screenshots.

WITH table_stats AS (
    SELECT 
        table_name, 
        (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_estimate
    FROM (
        SELECT table_name, 
        query_to_xml(format('select count(*) as cnt from %I', table_name), false, true, '') as xml_count
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    ) t
)
SELECT 
    t.table_name,
    ts.row_estimate as approx_row_count,
    string_agg(c.column_name || ' (' || c.data_type || ')', ', ') as columns,
    (
        SELECT string_agg(p.policyname, ' | ')
        FROM pg_policies p 
        WHERE p.tablename = t.table_name
    ) as rls_policies
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
JOIN table_stats ts ON ts.table_name = t.table_name
WHERE t.table_schema = 'public'
GROUP BY t.table_name, ts.row_estimate;

-- Also check AUTH users count (can't see emails for privacy in this mode, but count helps)
SELECT count(*) as total_auth_users FROM auth.users;
