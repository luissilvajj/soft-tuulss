import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

console.log('--- DIAGNOSTIC RESULT ---');

if (!fs.existsSync(envPath)) {
    console.error('CRITICAL: .env file DOES NOT EXIST at ' + envPath);
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf-8');
const lines = content.split('\n');

let url = '';
let key = '';

for (const line of lines) {
    if (line.startsWith('SUPABASE_URL=')) {
        url = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_KEY=')) {
        key = line.split('=')[1].trim();
    }
}

// Check URL
if (!url) {
    console.error('ERROR: SUPABASE_URL is missing or empty.');
} else {
    if (!url.startsWith('https://')) {
        console.error('ERROR: SUPABASE_URL does not start with "https://". Current start: ' + url.substring(0, 8));
    } else if (url.includes('your-project-url')) {
        console.error('ERROR: SUPABASE_URL appears to be a placeholder ("your-project-url").');
    } else {
        console.log('SUCCESS: SUPABASE_URL looks correctly formatted (Starts with https://).');
    }
}

// Check Key
if (!key) {
    console.error('ERROR: SUPABASE_KEY is missing or empty.');
} else {
    if (!key.startsWith('eyJ')) {
        console.error('ERROR: SUPABASE_KEY does not look like a valid JWT (should start with "eyJ"). Current start: ' + key.substring(0, 5));
    } else if (key.includes('your-anon-key')) {
        console.error('ERROR: SUPABASE_KEY appears to be a placeholder ("your-anon-key").');
    } else {
        console.log('SUCCESS: SUPABASE_KEY looks like a valid JWT.');
    }
}

if (url && key && url.startsWith('https://') && key.startsWith('eyJ')) {
    console.log('CONCLUSION: Syntax looks okay. Issue is likely NETWORK related (Firewall/VPN) or the project feature is paused in Supabase dashboard.');
}

console.log('-------------------------');
