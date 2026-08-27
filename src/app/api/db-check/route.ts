import { NextResponse } from 'next/server';
import { supabase, isMock } from '@/lib/supabase';

export async function GET() {
  if (isMock) {
    return NextResponse.json({
      status: 'mock_mode',
      message: 'Running in local mock mode because Supabase URL or Anon Key is not configured.',
      connected: false
    });
  }

  const results: Record<string, any> = {};

  const tables = [
    'profiles',
    'bookings',
    'ride_postings',
    'recurring_templates',
    'incidents',
    'notifications',
    'payments'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        results[table] = { ok: false, error: error.message };
      } else {
        results[table] = { ok: true };
      }
    } catch (err: unknown) {
      results[table] = { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  // Check storage bucket (and attempt auto-creation if missing)
  try {
    let { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    let hasBucket = buckets?.some((b: { name: string }) => b.name === 'verification-docs');

    if (!hasBucket) {
      // Attempt auto-creation via Storage API
      const { data: createData, error: createErr } = await supabase.storage.createBucket('verification-docs', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      });

      if (!createErr) {
        hasBucket = true;
      }
    }

    results['storage:verification-docs'] = {
      ok: hasBucket,
      message: hasBucket 
        ? 'Bucket verification-docs is active and ready' 
        : 'Bucket not found. Run SQL or create in Supabase dashboard.'
    };
  } catch (err: unknown) {
    results['storage:verification-docs'] = { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }

  const allTablesOk = tables.every(t => results[t]?.ok === true);
  const storageOk = results['storage:verification-docs']?.ok === true;

  return NextResponse.json({
    status: allTablesOk && storageOk ? 'healthy' : 'issues_detected',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
    allTablesOk,
    storageOk,
    details: results
  });
}
