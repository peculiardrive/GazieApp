import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isFreeSundayChurchCommute } from '@/lib/communities';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://buxiqqduzatptmrdkcwu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(req: Request) {
  try {
    const { bookingId, riderId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    // 1. Fetch booking record using Admin client (bypasses RLS)
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      console.error('Free Unlock Route: Booking not found for id:', bookingId);
      return NextResponse.json({ error: 'Booking record not found' }, { status: 404 });
    }

    // Security check: ensure rider ID matches if provided
    if (riderId && booking.rider_id !== riderId) {
      return NextResponse.json({ error: 'Unauthorized booking access' }, { status: 403 });
    }

    // 2. If already confirmed, return success immediately
    if (booking.status === 'confirmed' || booking.status === 'matched') {
      return NextResponse.json({
        success: true,
        message: 'Match already confirmed and unlocked.',
        booking
      });
    }

    // 3. Verify that this booking qualifies for the Sunday / Church free pass
    const isEligible = isFreeSundayChurchCommute({
      date: booking.requested_date,
      communityName: booking.community_name,
      pickup: booking.pickup,
      destination: booking.destination
    });

    if (!isEligible) {
      return NextResponse.json({
        error: 'This ride does not qualify for the Free Sunday Church pass.'
      }, { status: 400 });
    }

    // 4. Fetch ride posting to verify and decrement seat count
    if (booking.ride_posting_id) {
      const { data: posting } = await supabaseAdmin
        .from('ride_postings')
        .select('*')
        .eq('id', booking.ride_posting_id)
        .single();

      if (posting && posting.seats_available > 0) {
        const nextSeats = Math.max(0, posting.seats_available - 1);
        await supabaseAdmin
          .from('ride_postings')
          .update({
            seats_available: nextSeats,
            status: nextSeats === 0 ? 'full' : 'active'
          })
          .eq('id', posting.id);
      }
    }

    // 5. Update booking status to confirmed with ₦0 platform fee
    const { data: updatedBooking, error: updateErr } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        platform_fee: 0
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateErr) {
      console.error('Free Unlock Route: Booking status update failed:', updateErr);
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
    }

    // 6. Record zero-fee promo transaction in payments table
    const freeRef = `free_sunday_${bookingId}_${Date.now()}`;
    await supabaseAdmin
      .from('payments')
      .upsert({
        booking_id: bookingId,
        reference: freeRef,
        amount: 0,
        status: 'success'
      }, { onConflict: 'reference' });

    // 7. Insert in-app notifications for rider and driver
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: booking.rider_id,
        title: '⛪ Free Sunday Fellowship Pass Confirmed!',
        message: `Your Sunday ride match from ${booking.pickup} to ${booking.destination} has been confirmed at ₦0 platform fee! Driver contact details are now unlocked.`,
        read: false
      },
      ...(booking.driver_id ? [{
        user_id: booking.driver_id,
        title: '⛪ Sunday Fellowship Passenger Confirmed',
        message: `A passenger has joined your Sunday commute from ${booking.pickup} to ${booking.destination}. Brethren riding together!`,
        read: false
      }] : [])
    ]);

    return NextResponse.json({
      success: true,
      message: 'Sunday Church Pass confirmed and unlocked for free!',
      booking: updatedBooking
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Free Unlock Route Error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
