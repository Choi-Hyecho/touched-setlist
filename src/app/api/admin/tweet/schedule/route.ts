import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { text, image, scheduledAt } = await request.json() as {
      text?: string; image?: string | null; scheduledAt?: string;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: '게시할 텍스트가 없습니다.' }, { status: 400 });
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
    if (!scheduledDate || Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: '예약 시각이 올바르지 않습니다.' }, { status: 400 });
    }
    if (scheduledDate.getTime() <= Date.now()) {
      return NextResponse.json({ error: '예약 시각은 현재 이후여야 합니다.' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('scheduled_tweets')
      .insert({ text, image: image ?? null, scheduled_at: scheduledDate.toISOString() })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    const message = (err as Error)?.message || '예약 등록 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
