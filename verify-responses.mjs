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

const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, key);

async function check() {
    const { data: resp, error: rErr } = await supabase.from('survey_responses').select('survey_id');
    if (rErr) return console.error(rErr);

    const uniqueIds = [...new Set(resp.map(r => r.survey_id))];
    console.log('Survey IDs with responses:', uniqueIds);

    const { data: surveys, error: sErr } = await supabase.from('survey').select('id, title').in('id', uniqueIds);
    if (sErr) return console.error(sErr);

    console.log('Surveys that actually have responses in DB:');
    console.table(surveys);
}

check();
