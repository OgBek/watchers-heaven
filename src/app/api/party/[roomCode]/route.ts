import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updatePlaybackSchema, roomCodeSchema } from '@/lib/watch-party/validation';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    
    // 1. Validate room code
    if (!roomCodeSchema.safeParse(roomCode).success) {
      return NextResponse.json({ error: 'Invalid room code format' }, { status: 400 });
    }

    // 2. Fetch party from DB
    // RLS policy "Anyone can read active parties" handles access control
    const supabase = createServerSupabaseClient();
    const { data: party, error } = await supabase
      .from('watch_parties')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !party) {
      return NextResponse.json({ error: 'Party not found or inactive' }, { status: 404 });
    }

    return NextResponse.json(party);

  } catch (error) {
    console.error('Error fetching party:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    
    // 1. Validate room code
    if (!roomCodeSchema.safeParse(roomCode).success) {
      return NextResponse.json({ error: 'Invalid room code format' }, { status: 400 });
    }

    // 2. Ensure user is authenticated
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse and validate payload
    const body = await req.json();
    const result = updatePlaybackSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload', details: result.error.errors }, { status: 400 });
    }

    const { playing, currentTime } = result.data;

    // 4. Update the database
    // The RLS policy "Only host can update own party" enforces authorization
    const { data: party, error: updateError } = await supabase
      .from('watch_parties')
      .update({
        playing,
        current_time: currentTime,
        updated_at: new Date().toISOString()
      })
      .eq('room_code', roomCode)
      // Check host again here just to be safe, though RLS does this
      .eq('host_user_id', session.user.id)
      .select()
      .single();

    if (updateError || !party) {
      return NextResponse.json({ error: 'Failed to update party. You may not be the host.' }, { status: 403 });
    }

    return NextResponse.json(party);

  } catch (error) {
    console.error('Error updating party:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
