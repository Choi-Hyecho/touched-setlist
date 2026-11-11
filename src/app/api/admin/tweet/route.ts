import { NextRequest, NextResponse } from 'next/server';
import { postTweet, describeTweetError } from '@/lib/postTweet';

export async function POST(request: NextRequest) {
  try {
    const { text, image } = await request.json() as { text?: string; image?: string | null };
    if (!text?.trim()) {
      return NextResponse.json({ error: '게시할 텍스트가 없습니다.' }, { status: 400 });
    }

    const { id } = await postTweet(text, image);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[tweet] post failed', err);
    return NextResponse.json({ error: describeTweetError(err) }, { status: 500 });
  }
}
