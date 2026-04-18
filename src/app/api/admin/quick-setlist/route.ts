import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface SetlistEntry {
  title: string;
  order: number;
  notes: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { date, entries } = await request.json() as {
      date: string;
      entries: SetlistEntry[];
    };

    if (!date || !entries?.length) {
      return NextResponse.json({ error: '날짜와 곡 목록이 필요합니다.' }, { status: 400 });
    }

    // 1. 날짜로 공연 찾기
    const { data: schedule, error: scheduleError } = await supabaseServer
      .from('schedules')
      .select('id, title')
      .eq('performancedate', date)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json({ error: `${date} 날짜의 공연을 찾을 수 없습니다.` }, { status: 404 });
    }

    // 2. 곡 제목으로 songs 테이블에서 id 찾기
    const songTitles = [...new Set(entries.map(e => e.title))];
    const { data: songs, error: songsError } = await supabaseServer
      .from('songs')
      .select('id, title')
      .in('title', songTitles);

    if (songsError) {
      return NextResponse.json({ error: '곡 검색 오류: ' + songsError.message }, { status: 500 });
    }

    const songMap = new Map((songs ?? []).map(s => [s.title, s.id]));

    // 3. 매칭 결과 정리
    const matched: { song_id: string; order: number; notes: string | null }[] = [];
    const notFound: string[] = [];

    for (const entry of entries) {
      const songId = songMap.get(entry.title);
      if (songId) {
        matched.push({ song_id: songId, order: entry.order, notes: entry.notes });
      } else {
        notFound.push(entry.title);
      }
    }

    if (matched.length === 0) {
      return NextResponse.json({
        error: '매칭된 곡이 없습니다.',
        notFound,
      }, { status: 422 });
    }

    // 4. 기존 세트리스트 삭제 후 재삽입
    await supabaseServer
      .from('setlists')
      .delete()
      .eq('schedule_id', schedule.id);

    const insertRows = matched.map(m => ({
      schedule_id: schedule.id,
      song_id: m.song_id,
      order: m.order,
      notes: m.notes,
    }));

    const { error: insertError } = await supabaseServer
      .from('setlists')
      .insert(insertRows);

    if (insertError) {
      return NextResponse.json({ error: '저장 오류: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      schedule: { id: schedule.id, title: schedule.title, date },
      inserted: matched.length,
      notFound,
    });
  } catch (err) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
