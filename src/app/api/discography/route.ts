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

    // 앨범 내 곡 순서: track_number(있으면) → 등록 순서(created_at)
    // DB 기본 반환 순서는 보장되지 않아서(행 수정 시 뒤로 밀림) 명시적으로 정렬한다.
    type SongRow = { track_number?: number | null; created_at?: string | null };
    const albums = ((albumsResult.data ?? []) as { songs?: SongRow[] }[]).map(album => ({
      ...album,
      songs: [...(album.songs ?? [])].sort((a, b) => {
        const ta = a.track_number ?? Number.POSITIVE_INFINITY;
        const tb = b.track_number ?? Number.POSITIVE_INFINITY;
        if (ta !== tb) return ta - tb;
        return (a.created_at ?? '').localeCompare(b.created_at ?? '');
      }),
    }));

    const response = NextResponse.json({
      albums,
      others: othersResult.data ?? [],
    });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
