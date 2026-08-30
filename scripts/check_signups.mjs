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
  try {
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('Error fetching users:', userError);
    } else {
      console.log(`=== TOTAL AUTH USERS: ${users?.users?.length || 0} ===`);
      const sortedUsers = (users?.users || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      sortedUsers.forEach(u => {
        console.log(`User: ${u.email || u.phone} | Created: ${u.created_at} | Confirmed: ${u.email_confirmed_at ? 'YES' : 'NO'} | Last Login: ${u.last_sign_in_at || 'Never'}`);
      });
    }

    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    console.log(`\n=== TOTAL PROFILES: ${profiles?.length || 0} ===`);
    (profiles || []).forEach(p => {
      console.log(`Profile: ${p.full_name || 'N/A'} | Email: ${p.email} | Phone: ${p.phone} | Role: ${p.role} | Created: ${p.created_at}`);
    });

    const { data: drivers } = await supabase.from('driver_verifications').select('*').order('created_at', { ascending: false });
    console.log(`\n=== DRIVER VERIFICATIONS: ${drivers?.length || 0} ===`);
    (drivers || []).forEach(d => {
      console.log(`Driver ID: ${d.user_id} | Status: ${d.status} | NIN: ${d.nin || 'N/A'} | Licence: ${d.drivers_licence || 'N/A'} | Submitted: ${d.created_at}`);
    });

    const { data: waitlist } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
    console.log(`\n=== WAITLIST: ${waitlist?.length || 0} ===`);
    (waitlist || []).forEach(w => {
      console.log(`Waitlist: ${w.email || w.phone} | Created: ${w.created_at}`);
    });

    const { data: rides } = await supabase.from('rides').select('*').order('created_at', { ascending: false });
    console.log(`\n=== RIDES POSTED: ${rides?.length || 0} ===`);
    (rides || []).forEach(r => {
      console.log(`Ride: ${r.origin} -> ${r.destination} | Date: ${r.departure_time} | Status: ${r.status}`);
    });
  } catch (err) {
    console.error('Error running check:', err);
  }
}

check();
