import { supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  try {
    const [albumsResult, othersResult] = await Promise.all([
      supabaseServer
        .from('albums')
        .select('*, songs(*)')
        .order('releasedate', { ascending: false }),
      supabaseServer
        .from('songs')
        .select('*')
        .is('album_id', null)
        .order('title', { ascending: true }),
    ]);

    if (albumsResult.error) throw albumsResult.error;
    if (othersResult.error) throw othersResult.error;

    const response = NextResponse.json({
      albums: albumsResult.data ?? [],
      others: othersResult.data ?? [],
    });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
