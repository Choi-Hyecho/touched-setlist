// X(트위터)의 가중치 글자 수 계산 (twitter-text v3 규칙 간이 구현)
// - 라틴 문자/숫자/기본 기호 등: 1자
// - 한글·한자·일본어 등 그 외 문자: 2자
// - 이모지: 2자 (ZWJ 조합 이모지도 1개로)
// - URL: 길이와 무관하게 23자
export const TWEET_MAX_LENGTH = 280;

const URL_LENGTH = 23;
const URL_REGEX = /https?:\/\/[^\s]+/g;
const LIGHT_RANGES: [number, number][] = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

function charWeight(codePoint: number) {
  return LIGHT_RANGES.some(([s, e]) => codePoint >= s && codePoint <= e) ? 1 : 2;
}

export function countTweetLength(text: string): number {
  const normalized = text.normalize('NFC');
  let length = 0;

  const urls = normalized.match(URL_REGEX) ?? [];
  length += urls.length * URL_LENGTH;
  const rest = normalized.replace(URL_REGEX, '');

  // 이모지 조합(ZWJ 등)을 한 덩어리로 세기 위해 grapheme 단위로 분리 (미지원 환경은 코드포인트 단위)
  type GraphemeSegmenter = { segment(input: string): Iterable<{ segment: string }> };
  const SegmenterCtor = (Intl as unknown as {
    Segmenter?: new (locale?: string, opts?: { granularity: 'grapheme' }) => GraphemeSegmenter;
  }).Segmenter;
  const graphemes = SegmenterCtor
    ? Array.from(new SegmenterCtor(undefined, { granularity: 'grapheme' }).segment(rest), s => s.segment)
    : Array.from(rest);

  for (const g of graphemes) {
    if (EMOJI_REGEX.test(g)) { length += 2; continue; }
    for (const ch of g) length += charWeight(ch.codePointAt(0) ?? 0);
  }
  return length;
}
