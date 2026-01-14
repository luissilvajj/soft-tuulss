
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { email, role, organization_id } = await req.json()

        if (!email || !role || !organization_id) throw new Error('Missing fields')

        // 1. Get Caller User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Validate Caller is Owner
        const { data: memberData } = await supabaseClient
            .from('organization_members')
            .select('role')
            .eq('organization_id', organization_id)
            .eq('user_id', user.id)
            .single() // Expect one row

        if (!memberData || memberData.role !== 'owner') {
            throw new Error('Forbidden: Only owners can invite members')
        }

        // 3. Admin Action: Invite User
        // We need Service Role Key for this
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

        if (inviteError) throw inviteError

        const newUserId = inviteData.user.id

        // 4. Add to Organization Members
        // Check if membership already exists to avoid dupes
        const { error: memberError } = await supabaseAdmin
            .from('organization_members')
            .upsert({
                organization_id: organization_id,
                user_id: newUserId,
                role: role
            })

        if (memberError) throw memberError

        return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
