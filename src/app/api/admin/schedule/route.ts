import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json(null, { status: 400 });

  const { data, error } = await supabaseServer
    .from('schedules')
    .select('id, title, venue, city, setlists(id, song_id, order, notes, songs(id, title))')
    .eq('performancedate', date)
    .order('title', { ascending: true });

  if (error || !data?.length) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data);
}
