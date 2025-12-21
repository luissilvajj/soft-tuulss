import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load env from .env file
const envConfig = dotenv.parse(fs.readFileSync('.env'))
const url = envConfig.SUPABASE_URL
const key = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_KEY || envConfig.SUPABASE_KEY

if (!url || !key) {
    console.error('Missing Supabase URL or Key in .env')
    process.exit(1)
}

if (!envConfig.SUPABASE_SERVICE_ROLE_KEY && !envConfig.SUPABASE_SERVICE_KEY) {
    console.warn('⚠️ WARNING: Using Anon Key (SUPABASE_KEY). RLS policies may hide data.')
}

const supabase = createClient(url, key)

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---')

    // 1. Fetch all organizations
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id, name, owner_id')
    if (orgError) {
        console.error('Error fetching orgs:', orgError)
        return
    }
    console.log(`Found ${orgs.length} Organizations:`)
    orgs.forEach(o => console.log(` - [${o.id}] ${o.name} (Owner: ${o.owner_id})`))

    // 2. Fetch recent transactions
    const { data: txs, error: txError } = await supabase.from('transactions').select('id, amount, type, organization_id, date').order('date', { ascending: false }).limit(20)

    if (txError) {
        console.error('Error fetching transactions:', txError)
        return
    }

    console.log(`\nFound ${txs.length} Recent Transactions:`)
    txs.forEach(t => {
        const orgName = orgs.find(o => o.id === t.organization_id)?.name || 'UNKNOWN ORG'
        console.log(` - ${t.date} | $${t.amount} (${t.type}) | Org: ${t.organization_id} (${orgName})`)
    })

    // 3. Analysis
    const orphaned = txs.filter(t => !t.organization_id)
    if (orphaned.length > 0) {
        console.log(`\n⚠️ CRITICAL: Found ${orphaned.length} transactions with NO Organization ID!`)
    } else {
        console.log('\n✅ All recent transactions have an Organization ID.')
    }

    console.log('--- DIAGNOSTIC END ---')
}

diagnose()
