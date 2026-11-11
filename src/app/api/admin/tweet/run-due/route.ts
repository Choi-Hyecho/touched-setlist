import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { postTweet, describeTweetError } from '@/lib/postTweet';

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 도래한 예약 건을 processing으로 선점해 중복 실행(겹쳐 도는 크론)으로 인한 중복 발행을 막는다.
  const { data: claimed, error: claimError } = await supabaseServer
    .from('scheduled_tweets')
    .update({ status: 'processing' })
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .select();

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  for (const row of claimed ?? []) {
    try {
      const { id: tweetId } = await postTweet(row.text, row.image);
      await supabaseServer
        .from('scheduled_tweets')
        .update({ status: 'posted', tweet_id: tweetId, posted_at: new Date().toISOString() })
        .eq('id', row.id);
    } catch (err) {
      console.error('[tweet] scheduled post failed', row.id, err);
      const message = describeTweetError(err);
      await supabaseServer
        .from('scheduled_tweets')
        .update({ status: 'failed', error: message })
        .eq('id', row.id);
    }
  }

  return NextResponse.json({ processed: claimed?.length ?? 0 });
}
