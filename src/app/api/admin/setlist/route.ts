import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface SetlistEntry {
  song_id: string;
  order: number;
  notes: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { schedule_id, entries } = await request.json() as { schedule_id: string; entries: SetlistEntry[] };

    if (!schedule_id || !entries?.length) {
      return NextResponse.json({ error: 'schedule_id와 곡 목록이 필요합니다.' }, { status: 400 });
    }

    const { data: schedule, error: scheduleError } = await supabaseServer
      .from('schedules')
      .select('id, title')
      .eq('id', schedule_id)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json({ error: '공연을 찾을 수 없습니다.' }, { status: 404 });
    }

    await supabaseServer.from('setlists').delete().eq('schedule_id', schedule.id);

    const rows = entries
      .filter(e => e.song_id)
      .map(e => ({ schedule_id: schedule.id, song_id: e.song_id, order: e.order, notes: e.notes }));

    const { error: insertError } = await supabaseServer.from('setlists').insert(rows);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ success: true, schedule: { id: schedule.id, title: schedule.title }, inserted: rows.length });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
