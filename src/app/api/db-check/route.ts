import { NextResponse } from 'next/server';
import { supabase, isMock } from '@/lib/supabase';

export async function GET(req: Request) {
  // Prevent public information disclosure in production
  const authHeader = req.headers.get('x-admin-key') || req.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && (!authHeader || !adminSecret || (authHeader !== adminSecret && authHeader !== `Bearer ${adminSecret}`))) {
    return NextResponse.json(
      { error: 'Unauthorized: Diagnostic endpoint restricted' },
      { status: 403 }
    );
  }

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

  // Check storage bucket connectivity
  try {
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    const hasInList = buckets?.some((b: { name: string }) => b.name === 'verification-docs');
    
    // Also test public URL generation for verification-docs
    const { data: urlData } = supabase.storage.from('verification-docs').getPublicUrl('probe.txt');
    const isUrlConfigured = !!urlData?.publicUrl;

    const isStorageActive = !!(hasInList || isUrlConfigured);

    results['storage:verification-docs'] = {
      ok: isStorageActive,
      publicUrlAccessible: isUrlConfigured,
      message: isStorageActive 
        ? 'Bucket verification-docs is configured and accessible' 
        : 'Bucket not found. Ensure verification-docs bucket is created in Supabase.'
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
