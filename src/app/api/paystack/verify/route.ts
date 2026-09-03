import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://buxiqqduzatptmrdkcwu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(req: Request) {
  try {
    const { reference, bookingId } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    if (!paystackSecret) {
      console.error('PAYSTACK_SECRET_KEY is missing on server');
      return NextResponse.json({ error: 'Payment gateway configuration is incomplete' }, { status: 500 });
    }

    // 1. Verify transaction status with Paystack REST API
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData?.status || verifyData.data?.status !== 'success') {
      console.warn('Paystack transaction verification failed:', verifyData);
      return NextResponse.json({
        success: false,
        error: verifyData?.message || 'Transaction is not verified or is still pending.'
      }, { status: 400 });
    }

    const transaction = verifyData.data;
    const amountPaid = (transaction.amount || 5000) / 100;
    const targetBookingId = bookingId || transaction.metadata?.booking_id || reference.split('_')[1];

    if (!targetBookingId) {
      return NextResponse.json({ error: 'Could not resolve target booking for this transaction' }, { status: 400 });
    }

    // 2. Fetch booking record using Admin client (bypassing RLS)
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', targetBookingId)
      .single();

    if (bookingErr || !booking) {
      console.error('Verify Route: Booking not found for id:', targetBookingId);
      return NextResponse.json({ error: 'Booking record not found' }, { status: 404 });
    }

    // 3. If already confirmed, return success immediately
    if (booking.status === 'confirmed' || booking.status === 'matched') {
      return NextResponse.json({
        success: true,
        message: 'Match already confirmed and unlocked.',
        booking
      });
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

    // 5. Update booking status to confirmed
    const { data: updatedBooking, error: updateErr } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        platform_fee: amountPaid
      })
      .eq('id', targetBookingId)
      .select()
      .single();

    if (updateErr) {
      console.error('Verify Route: Booking status update failed:', updateErr);
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
    }

    // 6. Record payment in payments table
    await supabaseAdmin
      .from('payments')
      .upsert({
        booking_id: targetBookingId,
        reference: transaction.reference,
        amount: amountPaid,
        status: 'success'
      }, { onConflict: 'reference' });

    // 7. Insert in-app notifications for rider and driver
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: booking.rider_id,
        title: 'Unlock Confirmed!',
        message: `Payment verified. Your ride match from ${booking.pickup} to ${booking.destination} has been confirmed! Driver details are now unlocked.`,
        read: false
      },
      ...(booking.driver_id ? [{
        user_id: booking.driver_id,
        title: 'Passenger Confirmed',
        message: `A passenger has completed payment and joined your posted commute from ${booking.pickup} to ${booking.destination}.`,
        read: false
      }] : [])
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and match confirmed successfully!',
      booking: updatedBooking
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Paystack Verify Route Error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
