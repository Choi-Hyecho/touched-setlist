import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('songs')
    .select('id, title, artist, albums(id, title, albumtype)')
    .order('title', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  try {
    const { title, artist, category } = await request.json() as { title: string; artist?: string; category: string };

    if (!title?.trim()) {
      return NextResponse.json({ error: '곡 제목이 필요합니다.' }, { status: 400 });
    }

    // category 이름과 동일한 앨범 title로 조회
    const { data: album } = await supabaseServer
      .from('albums').select('id').eq('title', category).single();

    const { data: song, error: insertError } = await supabaseServer
      .from('songs')
      .insert({ title: title.trim(), artist: artist?.trim() || 'TOUCHED', album_id: album?.id ?? null })
      .select('id, title, artist, albums(id, title, albumtype)')
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json(song);
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
