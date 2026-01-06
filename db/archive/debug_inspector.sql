-- DEBUG INSPECTOR
-- Run this in Supabase SQL Editor to see if you actually have data.
-- Replace the UUID below with YOUR User ID found in the console logs (e.g., 96a3fc95-0ea9-44db-a6b8-6523e7edd279)

DO $$
DECLARE
    target_user uuid := '96a3fc95-0ea9-44db-a6b8-6523e7edd279'; -- CAMBIAR SI ES NECESARIO
    member_count int;
    org_count int;
    rpc_result json;
BEGIN
    -- 1. Check Memberships (Raw count)
    SELECT count(*) INTO member_count FROM organization_members WHERE user_id = target_user;
    RAISE NOTICE 'User has % memberships in raw table.', member_count;

    -- 2. Check Organizations (Raw count linked to user)
    SELECT count(*) INTO org_count 
    FROM organizations o
    JOIN organization_members m ON m.organization_id = o.id
    WHERE m.user_id = target_user;
    RAISE NOTICE 'User has % valid linked organizations.', org_count;

    -- 3. Test RPC V3
    BEGIN
        SELECT public.get_web_user_organizations_v3(target_user) INTO rpc_result;
        RAISE NOTICE 'RPC V3 Result: %', rpc_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'RPC V3 Failed: %', SQLERRM;
    END;
END $$;
