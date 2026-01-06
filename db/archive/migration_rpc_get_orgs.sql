-- Create a secure function to fetch organizations bypassing RLS issues
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_web_user_organizations()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges (Bypasses RLS)
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            o.id,
            o.name,
            -- Handle potential missing column gracefully with manual checks if needed, 
            -- but for now assuming they exist since you ran the previous script.
            o.subscription_status,
            COALESCE(o.logo_url, '') as logo_url,
            m.role
        FROM organization_members m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.user_id = auth.uid()
    ) t;

    -- Return empty array if null
    RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_web_user_organizations TO authenticated;


