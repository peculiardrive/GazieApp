import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SEED_CHURCHES, SEED_ZONES, SEED_CELLS } from '@/lib/churches';

export async function GET(request: Request) {
  try {
    // Attempt query from Supabase table
    const { data: dbChurches, error } = await supabase
      .from('churches')
      .select('*')
      .order('name', { ascending: true });

    if (error || !dbChurches || dbChurches.length === 0) {
      // Fallback to seed churches
      return NextResponse.json({
        success: true,
        source: 'seed',
        churches: SEED_CHURCHES,
        zones: SEED_ZONES,
        cells: SEED_CELLS
      });
    }

    const { data: dbZones } = await supabase.from('church_zones').select('*');
    const { data: dbCells } = await supabase.from('church_cells').select('*');

    return NextResponse.json({
      success: true,
      source: 'database',
      churches: dbChurches,
      zones: dbZones || [],
      cells: dbCells || []
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Error loading church communities',
      churches: SEED_CHURCHES
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, denomination, address, city, service_times, slug } = body;

    if (!name || !address) {
      return NextResponse.json({ success: false, error: 'Name and address are required.' }, { status: 400 });
    }

    const churchSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('churches')
      .insert({
        name,
        denomination: denomination || 'Christian Ministry',
        address,
        city: city || 'Abuja',
        service_times: service_times || ['Sunday 8:00 AM'],
        slug: churchSlug
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, church: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
