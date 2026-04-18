import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 1) return NextResponse.json([]);

  const { data, error } = await supabaseServer
    .from('schedules')
    .select('id, title, titleeng, performancedate, posterurl')
    .or(`title.ilike.%${q}%,titleeng.ilike.%${q}%,aliases.ilike.%${q}%`)
    .order('performancedate', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? []);
}
