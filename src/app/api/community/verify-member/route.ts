import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, status = 'community_verified', approvedBy } = body;

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'memberId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        community_verification_status: status
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Send in-app notification
    await supabase.from('notifications').insert({
      user_id: memberId,
      title: status === 'community_verified' ? 'Church Fellowship Verified! ⛪' : 'Community Status Updated',
      message: status === 'community_verified'
        ? 'Your fellowship membership verification has been approved! Brethren can now see your verified church badge.'
        : 'Your fellowship verification status was updated.'
    });

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
