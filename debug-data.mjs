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

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("--- Surveys ---");
    const { data: surveys, error: sErr } = await supabase.from('survey').select('id, title');
    if (sErr) console.error("Survey Error:", sErr);
    else console.log(surveys);

    console.log("\n--- Survey Responses (First 10) ---");
    const { data: responses, error: rErr } = await supabase.from('survey_responses').select('*').limit(10);
    if (rErr) console.error("Response Error:", rErr);
    else console.log(responses);

    if (surveys && surveys.length > 0) {
        const id = surveys[0].id;
        console.log(`\n--- Responses for survey ${id} ---`);
        const { data: specific, error: spErr } = await supabase.from('survey_responses').select('*').eq('survey_id', id);
        if (spErr) console.error("Specific Error:", spErr);
        else console.log(`Count: ${specific.length}`);
    }
}

check();
