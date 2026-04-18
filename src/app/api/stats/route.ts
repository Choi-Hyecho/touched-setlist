import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 21600; // ISG: 6시간마다 재생성

export async function GET(request: NextRequest) {
  try {
    const statType = request.nextUrl.searchParams.get('type'); // 'top10', 'yearly', 'monthly'
    const year = request.nextUrl.searchParams.get('year') ||
      new Date().getFullYear().toString();

    if (statType === 'top10') {
      // TOP 10 곡
      const { data, error } = await supabaseServer
        .from('song_stats')
        .select(`
          song_id,
          playCount,
          songs(id, title)
        `)
        .eq('year', Number(year))
        .order('playCount', { ascending: false })
        .limit(10);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      const response = NextResponse.json(data);
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=21600, stale-while-revalidate=86400'
      );
      return response;
    }

    if (statType === 'yearly') {
      // 연도별 공연 통계
      const { data, error } = await supabaseServer
        .rpc('get_yearly_performance_stats', { target_year: Number(year) });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      const response = NextResponse.json(data);
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=21600, stale-while-revalidate=86400'
      );
      return response;
    }

    if (statType === 'monthly') {
      // 월별 공연 통계
      const { data, error } = await supabaseServer
        .from('schedules')
        .select('performancedate')
        .gte('performancedate', `${year}-01-01`)
        .lte('performancedate', `${year}-12-31`)
        .order('performancedate', { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // 클라이언트에서 월별로 그룹핑
      const monthlyStats = Array(12).fill(0);
      data?.forEach((schedule) => {
        const month = new Date(schedule.performancedate).getMonth();
        monthlyStats[month]++;
      });

      const formattedData = monthlyStats.map((count, idx) => ({
        month: `${idx + 1}월`,
        performances: count,
      }));

      const response = NextResponse.json(formattedData);
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=21600, stale-while-revalidate=86400'
      );
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid stat type' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
