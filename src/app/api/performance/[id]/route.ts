import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseServer
      .from('schedules')
      .select(`
        *,
        schedule_types(id, type_name, icon),
        setlists(
          id,
          order,
          notes,
          songs(
            id, title, artist,
            album_id, youtubeurl, spotifyurl, applemusicurl, melonurl, genieurl, bugsurl,
            albums(id, title, albumtype, albumarturl, releasedate)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
    }

    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
