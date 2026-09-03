import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://buxiqqduzatptmrdkcwu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(req: Request) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    const signature = req.headers.get('x-paystack-signature') || '';

    // Verify header exists
    if (!signature) {
      return NextResponse.json({ error: 'Missing x-paystack-signature' }, { status: 400 });
    }

    const rawBody = await req.text();

    // Verify webhook signature authenticity using timingSafeEqual to prevent timing attacks
    const expectedSignature = crypto
      .createHmac('sha512', paystackSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      console.warn('Paystack Webhook: Signature verification failed.');
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    console.log(`Paystack Webhook: Received event "${event}" with reference: "${data?.reference}"`);

    // Safely extract booking ID from metadata or formatted reference (gc_<bookingId>_<timestamp>)
    const rawRef = data?.reference || '';
    let bookingId = data?.metadata?.booking_id;

    if (!bookingId && Array.isArray(data?.metadata?.custom_fields)) {
      const field = data.metadata.custom_fields.find((f: any) => f.variable_name === 'booking_id');
      if (field?.value) bookingId = field.value;
    }

    if (!bookingId) {
      if (rawRef.startsWith('gc_')) {
        const parts = rawRef.split('_');
        bookingId = parts[1];
      } else if (rawRef.includes('_')) {
        bookingId = rawRef.split('_')[0];
      } else {
        bookingId = rawRef;
      }
    }

    if (event === 'charge.success') {
      const amountPaid = (data.amount || 10000) / 100; // Paystack is in kobo (₦100.00 is 10000 kobo)
      const paystackRef = data.reference;
      const status = data.status || 'success';

      // 1. Fetch booking record
      const { data: booking, error: bookingErr } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingErr || !booking) {
        console.error('Paystack Webhook: Booking not found for reference:', bookingId);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Check if already processed
      if (booking.status === 'confirmed' || booking.status === 'matched') {
        console.log('Paystack Webhook: Booking already confirmed.');
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // 2. Fetch ride posting to verify and update seat count
      const { data: posting, error: postingErr } = await supabaseAdmin
        .from('ride_postings')
        .select('*')
        .eq('id', booking.ride_posting_id)
        .single();

      if (postingErr || !posting) {
        console.error('Paystack Webhook: Ride posting not found for booking:', booking.ride_posting_id);
        return NextResponse.json({ error: 'Ride posting not found' }, { status: 404 });
      }

      // Handle race condition: seats just filled up before payment webhook executed
      if (posting.seats_available <= 0) {
        console.warn('Paystack Webhook: Seats already full. Marking payment_failed.');
        
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'payment_failed' })
          .eq('id', booking.id);

        await supabaseAdmin.from('notifications').insert({
          user_id: booking.rider_id,
          title: 'Unlock Match Failed',
          message: `Your payment was successful, but the last seat on the ride from ${booking.pickup} to ${booking.destination} was taken. Please contact support at gaziecommute@gmail.com for a refund.`,
          read: false
        });

        return NextResponse.json({ success: false, error: 'Seats full' });
      }

      // 3. Decrement seats available on the posting row
      const nextSeatsAvailable = Math.max(0, posting.seats_available - 1);
      await supabaseAdmin
        .from('ride_postings')
        .update({
          seats_available: nextSeatsAvailable,
          status: nextSeatsAvailable === 0 ? 'full' : 'active'
        })
        .eq('id', posting.id);

      // 4. Update the booking status and log platform fee
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'confirmed',
          platform_fee: amountPaid
        })
        .eq('id', booking.id);

      // 5. Store audit log entry in the payments table
      await supabaseAdmin
        .from('payments')
        .insert({
          booking_id: booking.id,
          reference: paystackRef,
          amount: amountPaid,
          status: status
        });

      // 6. Alert passenger and driver via in-app notification system
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: booking.rider_id,
          title: 'Unlock Confirmed!',
          message: `Payment verified. Your ride match from ${booking.pickup} to ${booking.destination} has been confirmed! Driver details are now unlocked.`,
          read: false
        },
        {
          user_id: posting.driver_id,
          title: 'Passenger Confirmed',
          message: `A passenger has completed payment and joined your posted commute from ${booking.pickup} to ${booking.destination}.`,
          read: false
        }
      ]);

      console.log(`Paystack Webhook: Match confirmed successfully for booking: ${bookingId}`);
      return NextResponse.json({ success: true, message: 'Match confirmed' });
    }

    if (event === 'charge.failed') {
      // Mark booking match status as payment_failed
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'payment_failed' })
        .eq('id', bookingId);

      await supabaseAdmin.from('notifications').insert({
        user_id: data?.metadata?.rider_id || data?.customer?.id || '',
        title: 'Payment Failed',
        message: 'Your platform unlock fee payment failed. Please retry to confirm your match.',
        read: false
      });

      console.log(`Paystack Webhook: Payment failed logged for booking: ${bookingId}`);
      return NextResponse.json({ success: true, message: 'Failure logged' });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Paystack Webhook Error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
