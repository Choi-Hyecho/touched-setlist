import { TwitterApi, ApiResponseError, EUploadMimeType } from 'twitter-api-v2';

export async function postTweet(text: string, image?: string | null): Promise<{ id: string }> {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
    throw new Error('트위터 API 키가 설정되지 않았습니다. 환경변수를 확인하세요.');
  }

  const client = new TwitterApi({
    appKey: TWITTER_API_KEY.trim(),
    appSecret: TWITTER_API_SECRET.trim(),
    accessToken: TWITTER_ACCESS_TOKEN.trim(),
    accessSecret: TWITTER_ACCESS_SECRET.trim(),
  });

  let mediaId: string | undefined;
  if (image?.startsWith('data:image/')) {
    const base64 = image.split(',')[1];
    if (base64) {
      // v1.1 media/upload는 X에서 폐기됨 → v2 업로드 엔드포인트 사용
      mediaId = await client.v2.uploadMedia(Buffer.from(base64, 'base64'), {
        media_type: EUploadMimeType.Png,
        media_category: 'tweet_image',
      });
    }
  }

  const { data } = await client.v2.tweet(text, mediaId ? { media: { media_ids: [mediaId] } } : undefined);
  return { id: data.id };
}

// X API 오류를 원인별로 알아볼 수 있는 한국어 메시지로 변환한다.
export function describeTweetError(err: unknown): string {
  if (err instanceof ApiResponseError) {
    const data = err.data as { detail?: string; title?: string; errors?: { code?: number; message?: string }[] } | undefined;
    const raw = [data?.title, data?.detail, ...(data?.errors ?? []).map(e => `${e.code ?? ''} ${e.message ?? ''}`.trim())]
      .filter(Boolean).join(' / ') || err.message;

    if (err.code === 401) {
      return `[401 인증 실패] API Key/Secret 또는 Access Token/Secret이 틀렸거나 재발급되어 무효화되었습니다. `
        + `배포 환경(Netlify) 환경변수 4개를 최신 값으로 다시 넣고 재배포하세요. (${raw})`;
    }
    if (err.code === 403 && /longer than \d+ characters/i.test(raw)) {
      return `[글자 수 초과] X는 한글을 2자, 링크를 23자, 이모지를 2자로 계산해서 280자를 넘었어요. 텍스트를 줄여주세요.`;
    }
    if (err.code === 403) {
      return `[403 권한 없음] 앱 권한이 'Read and Write'가 아니거나, 권한 변경 전에 발급한 Access Token을 쓰고 있습니다. `
        + `Developer Portal > User authentication settings에서 Read and Write로 바꾼 뒤 Access Token/Secret을 재발급하세요. (${raw})`;
    }
    if (err.code === 402) {
      return `[402 크레딧 부족] X API 사용 한도/크레딧이 소진되었습니다. (${raw})`;
    }
    if (err.code === 429) {
      return `[429 요청 한도 초과] 잠시 후 다시 시도하세요. (${raw})`;
    }
    return `[${err.code}] ${raw}`;
  }
  return (err as Error)?.message || '트위터 게시 중 오류가 발생했습니다.';
}
