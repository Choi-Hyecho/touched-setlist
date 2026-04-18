import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600; // ISG: 1시간마다 재생성

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터
    const year = request.nextUrl.searchParams.get('year');
    const typeId = request.nextUrl.searchParams.get('type');

    let query = supabaseServer
      .from('schedules')
      .select(`
        *,
        schedule_types(id, type_name, icon)
      `)
      .order('performancedate', { ascending: false });

    // 연도별 필터
    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query
        .gte('performancedate', startDate)
        .lte('performancedate', endDate);
    }

    // 공연 타입별 필터
    if (typeId) {
      query = query.eq('schedule_type_id', Number(typeId));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // 캐싱 헤더 설정
    const response = NextResponse.json(data);
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인 필요 (생략 - 별도 미들웨어에서 처리)
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('schedules')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
