import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envStr.split('\n')) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...val] = line.split('=');
    envVars[key.trim()] = val.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
}

// try to find the service role key if it exists, otherwise use anon
const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log("Using key:", key.substring(0, 10) + "...");

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, key);

async function check() {
  const tables = ['survey', 'survey_questions', 'survey_responses'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) console.error(`Error on ${table}:`, error.message);
    else console.log(`${table}: ${count} rows`);
  }

  if (true) {
    const { data: latest, error: lErr } = await supabase.from('survey_responses').select('*').limit(5);
    if (lErr) console.error("Fetch Error:", lErr.message);
    else console.log("Latest 5 responses:", latest);
  }
}

check();
