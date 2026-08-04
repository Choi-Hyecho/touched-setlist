import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';

export async function POST(request: NextRequest) {
  try {
    const { text, image } = await request.json() as { text?: string; image?: string | null };
    if (!text?.trim()) {
      return NextResponse.json({ error: '게시할 텍스트가 없습니다.' }, { status: 400 });
    }

    const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
    if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
      return NextResponse.json({ error: '트위터 API 키가 설정되지 않았습니다. 환경변수를 확인하세요.' }, { status: 500 });
    }

    const client = new TwitterApi({
      appKey: TWITTER_API_KEY,
      appSecret: TWITTER_API_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_SECRET,
    });

    let mediaId: string | undefined;
    if (image?.startsWith('data:image/')) {
      const base64 = image.split(',')[1];
      if (base64) {
        mediaId = await client.v1.uploadMedia(Buffer.from(base64, 'base64'), { mimeType: EUploadMimeType.Png });
      }
    }

    const { data } = await client.v2.tweet(text, mediaId ? { media: { media_ids: [mediaId] } } : undefined);

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    const detail = (err as { data?: { detail?: string }; message?: string })?.data?.detail;
    const message = detail || (err as Error)?.message || '트위터 게시 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
