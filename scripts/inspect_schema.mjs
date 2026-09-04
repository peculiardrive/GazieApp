import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const tables = ['profiles', 'ride_postings', 'bookings', 'incidents', 'notifications', 'payments', 'ratings', 'recurring_templates', 'churches', 'church_zones', 'church_cells'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t}: Error/Not found (${error.message})`);
    } else {
      console.log(`Table ${t}: EXISTS! Sample columns:`, data.length > 0 ? Object.keys(data[0]) : '(table exists, 0 rows)');
    }
  }

  // Check profiles columns specifically
  const { data: pData } = await supabase.from('profiles').select('*').limit(1);
  if (pData && pData.length > 0) {
    console.log('Profile columns:', Object.keys(pData[0]));
  }
}

check();
