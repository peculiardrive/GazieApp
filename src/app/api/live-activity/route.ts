import { NextResponse } from 'next/server';
import { supabase, isMock } from '@/lib/supabase';

// Helper to sanitize route names and extract only the broad area name (to satisfy strict privacy requirements)
const cleanArea = (name: string): string => {
  if (!name) return 'Unknown';
  const lower = name.toLowerCase();
  if (lower.includes('lugbe')) return 'Lugbe';
  if (lower.includes('cbd') || lower.includes('central')) return 'CBD';
  if (lower.includes('garki')) return 'Garki';
  if (lower.includes('wuse')) return 'Wuse';
  if (lower.includes('airport')) return 'Airport Road';
  return name.split(',')[0].trim();
};

export async function GET() {
  if (isMock) {
    // Return realistic mock data for local server representation
    return NextResponse.json({
      ridesMatchedToday: 2,
      verifiedRiders: 15,
      verifiedDrivers: 6,
      mostActiveRouteToday: "Lugbe → Wuse",
      recentActivity: [
        { route: "Lugbe → Wuse", createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
        { route: "Lugbe → CBD", createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
      ]
    });
  }

  try {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format

    // 1. Fetch count of verified riders
    const { count: verifiedRidersCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'rider')
      .eq('verification_status', 'verified');

    // 2. Fetch count of verified drivers
    const { count: verifiedDriversCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'driver')
      .eq('verification_status', 'verified');

    // 3. Fetch matches scheduled/occurred today (status is confirmed or completed)
    const { data: bookingsToday } = await supabase
      .from('bookings')
      .select('pickup, destination')
      .eq('requested_date', todayStr)
      .in('status', ['confirmed', 'completed']);

    // 4. Fetch the 5 most recent matches (all-time confirmed or completed) for the ambient ticker
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('pickup, destination, created_at')
      .in('status', ['confirmed', 'completed'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate most active route today
    const routeCounts: Record<string, number> = {};
    (bookingsToday || []).forEach((b: any) => {
      const key = `${cleanArea(b.pickup)} → ${cleanArea(b.destination)}`;
      routeCounts[key] = (routeCounts[key] || 0) + 1;
    });

    let mostActiveRouteToday = null;
    let maxCount = 0;
    Object.entries(routeCounts).forEach(([route, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveRouteToday = route;
      }
    });

    // Format recent activity
    const recentActivity = (recentBookings || []).map((b: any) => ({
      route: `${cleanArea(b.pickup)} → ${cleanArea(b.destination)}`,
      createdAt: b.created_at
    }));

    return NextResponse.json({
      ridesMatchedToday: bookingsToday?.length || 0,
      verifiedRiders: verifiedRidersCount || 0,
      verifiedDrivers: verifiedDriversCount || 0,
      mostActiveRouteToday,
      recentActivity
    });
  } catch (err: any) {
    console.error('Error fetching live activity:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
