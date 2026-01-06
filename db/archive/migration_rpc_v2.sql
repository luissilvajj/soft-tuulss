-- Create V2 function that accepts UUID explicitly to avoid session context issues
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_web_user_organizations_v2(target_uid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT o.id, o.name, o.subscription_status, m.role
        FROM organization_members m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.user_id = target_uid
    ) t;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_web_user_organizations_v2 TO authenticated;
