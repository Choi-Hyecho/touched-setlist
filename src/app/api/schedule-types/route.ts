import { supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24시간마다 재생성

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('schedule_types')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const response = NextResponse.json(data);
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800'
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
