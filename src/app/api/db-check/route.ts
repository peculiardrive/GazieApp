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

  // Check storage bucket
  try {
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) {
      results['storage:verification-docs'] = { ok: false, error: bucketErr.message };
    } else {
      const hasBucket = buckets?.some((b: { name: string }) => b.name === 'verification-docs');
      results['storage:verification-docs'] = { 
        ok: hasBucket, 
        message: hasBucket ? 'Bucket found' : 'Bucket verification-docs not found. Please create it or run schema.sql' 
      };
    }
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
