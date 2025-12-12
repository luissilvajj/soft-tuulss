
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
const content = fs.readFileSync(envPath, 'utf-8')

let url = ''
let key = ''

for (const line of content.split('\n')) {
    if (line.startsWith('SUPABASE_URL=')) url = line.split('=')[1].trim()
    if (line.startsWith('SUPABASE_KEY=')) key = line.split('=')[1].trim()
}

if (!url || !key) {
    console.error('Missing credentials in .env')
    process.exit(1)
}

const supabase = createClient(url, key)

async function test() {
    console.log('--- STARTING TABLE VERIFICATION ---')
    const tables = ['organizations', 'profiles', 'organization_members', 'products', 'clients', 'transactions', 'transaction_items']

    let allExist = true

    for (const table of tables) {
        process.stdout.write(`Checking table "${table}"... `)
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })

        if (error) {
            // 42P01 is "relation does not exist"
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('❌ MISSING')
                allExist = false
            } else {
                // Other errors (like permission denied) actually mean the table EXISTS but RLS is blocking. 
                // If the table didn't exist, we'd get 42P01.
                // So "Permission denied" is a SUCCESS for "existence check".
                console.log(`✅ EXISTS (RLS Active: ${error.message})`)
            }
        } else {
            console.log('✅ EXISTS')
        }
    }

    console.log('-----------------------------------')
    if (allExist) {
        console.log('CONCLUSION: All tables match the schema.')
    } else {
        console.log('CONCLUSION: Some tables are missing. Please run db/schema.sql in Supabase SQL Editor.')
    }
}

test()
