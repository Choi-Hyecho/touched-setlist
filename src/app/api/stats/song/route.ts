import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const STAT_YEARS = [2025, 2026];

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get('id');

  if (!songId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // 이 곡이 포함된 setlists의 schedule_id 목록
  const { data: setlists } = await supabaseServer
    .from('setlists')
    .select('schedule_id')
    .eq('song_id', songId);

  if (!setlists?.length) {
    return NextResponse.json({
      years: STAT_YEARS.map((y) => ({ year: y, count: 0, lastPerf: null })),
      lastPerfOverall: null,
    });
  }

  const scheduleIds = setlists.map((sl: any) => sl.schedule_id);

  // 연도별 통계 + 전체 마지막 공연 병렬 조회
  const [{ data: schedules }, { data: allSchedules }] = await Promise.all([
    supabaseServer
      .from('schedules')
      .select('id, title, performancedate')
      .in('id', scheduleIds)
      .gte('performancedate', `${STAT_YEARS[0]}-01-01`)
      .lte('performancedate', `${STAT_YEARS[STAT_YEARS.length - 1]}-12-31`)
      .order('performancedate', { ascending: false }),
    supabaseServer
      .from('schedules')
      .select('id, title, performancedate')
      .in('id', scheduleIds)
      .order('performancedate', { ascending: false })
      .limit(1),
  ]);

  // 연도별 그룹핑
  const byYear = new Map<number, any[]>();
  for (const s of (schedules as any[]) ?? []) {
    const y = new Date(s.performancedate).getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(s);
  }

  const overall = (allSchedules as any[])?.[0] ?? null;

  return NextResponse.json({
    years: STAT_YEARS.map((y) => {
      const list = byYear.get(y) ?? [];
      return {
        year: y,
        count: list.length,
        lastPerf: list[0]
          ? { id: list[0].id, title: list[0].title, date: list[0].performancedate }
          : null,
      };
    }),
    lastPerfOverall: overall
      ? { id: overall.id, title: overall.title, date: overall.performancedate }
      : null,
  });
}
