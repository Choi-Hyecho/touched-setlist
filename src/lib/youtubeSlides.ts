import { format } from 'date-fns';
import {
  SITE_LABEL, roundRectPath, wrapToTwoLines, fitTitleFontSize, renderSetlistPoster,
  type PosterSongInput,
} from '@/lib/setlistPoster';

const SQ = 1080;
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

function createSquareCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = SQ; canvas.height = SQ;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스 초기화 실패');
  return { canvas, ctx };
}

// 정방형 배경 전체를 포스터로 채우되, 원본은 흐린 백드롭으로만 사용해 잘리거나 늘어나 보이지 않게 한다.
function drawBlurredBackdrop(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, dim: number) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, SQ, SQ);

  if (img) {
    const sourceRatio = img.width / img.height;
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
    if (sourceRatio > 1) { srcW = img.height; srcX = (img.width - srcW) / 2; }
    else if (sourceRatio < 1) { srcH = img.width; srcY = (img.height - srcH) / 2; }

    const pad = 80; // 블러 가장자리 투명 halo 방지용 오버드로우
    ctx.save();
    ctx.filter = 'blur(50px) brightness(0.5) saturate(1.05)';
    ctx.drawImage(img, srcX, srcY, srcW, srcH, -pad, -pad, SQ + pad * 2, SQ + pad * 2);
    ctx.restore();
  }

  ctx.fillStyle = `rgba(0,0,0,${dim})`;
  ctx.fillRect(0, 0, SQ, SQ);
}

// 원본 비율을 유지한 채(contain) 박스 안에 이미지를 그리고, 카드처럼 둥근 테두리+그림자를 씌운다.
function drawContainCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number, boxY: number, boxW: number, boxH: number,
  radius: number,
) {
  const scale = Math.min(boxW / img.width, boxH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = boxX + (boxW - dw) / 2;
  const dy = boxY + (boxH - dh) / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 16;
  roundRectPath(ctx, dx, dy, dw, dh, radius);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, dx, dy, dw, dh, radius);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, dx, dy, dw, dh, radius);
  ctx.stroke();

  return { dx, dy, dw, dh };
}

// 세트리스트 포스터와 같은 톤의 어두운 패널 + 상단 빨간 바
function drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, 'rgba(22,22,22,0.92)');
  grad.addColorStop(1, 'rgba(10,10,10,0.90)');
  ctx.fillStyle = grad;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.stroke();

  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = '#E62D2D';
  ctx.fillRect(x, y, w, 6);
  ctx.restore();
}

interface CoverOpts {
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  city: string | null;
}

// ── 1장: 커버 (포스터 + 날짜 + 공연명 + 공연장) ─────────────────────
function drawCoverSlide(img: HTMLImageElement | null, opts: CoverOpts): string {
  const { performanceTitle, performanceDate, venue, city } = opts;
  const date = new Date(performanceDate);
  const { canvas, ctx } = createSquareCanvas();

  drawBlurredBackdrop(ctx, img, 0.35);

  const padX = 90;
  let cursorY: number;

  if (img) {
    const boxY = 120, boxH = 540, boxW = SQ - padX * 2;
    const { dy, dh } = drawContainCard(ctx, img, padX, boxY, boxW, boxH, 22);
    cursorY = dy + dh + 64;
  } else {
    cursorY = 380;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const dateLine = `${format(date, 'yyyy.MM.dd')} (${WEEKDAYS_KO[date.getDay()]})`;
  ctx.font = '700 34px JetBrains Mono, monospace';
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(dateLine, SQ / 2, cursorY);
  ctx.restore();
  cursorY += 34;

  ctx.strokeStyle = '#E62D2D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(SQ / 2 - 26, cursorY);
  ctx.lineTo(SQ / 2 + 26, cursorY);
  ctx.stroke();
  cursorY += 46;

  const titleMaxW = SQ - padX * 2 - 40;
  const titleFs = fitTitleFontSize(ctx, performanceTitle, titleMaxW, 52, 28);
  ctx.font = `700 ${titleFs}px Pretendard, sans-serif`;
  const titleLines = wrapToTwoLines(ctx, performanceTitle, titleMaxW);
  ctx.fillStyle = '#ffffff';
  const titleLineH = titleFs + 12;
  titleLines.forEach((line, i) => ctx.fillText(line, SQ / 2, cursorY + titleFs + i * titleLineH));
  cursorY += titleLines.length * titleLineH + 30;

  ctx.font = '500 26px Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(city ? `${venue} · ${city}` : venue, SQ / 2, cursorY);

  ctx.font = '700 20px Montserrat, Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('SETLIST.TOUCHED', SQ / 2, SQ - 54);
  ctx.font = '400 17px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.26)';
  ctx.fillText(SITE_LABEL, SQ / 2, SQ - 30);

  ctx.textAlign = 'left';
  return canvas.toDataURL('image/png');
}

// ── 3장: 아웃트로 (전체 세트리스트·통계는 사이트에서) ─────────────────
function drawOutroSlide(img: HTMLImageElement | null): string {
  const { canvas, ctx } = createSquareCanvas();
  drawBlurredBackdrop(ctx, img, 0.55);

  const pX = 84, pY = 84, pW = SQ - 168, pH = SQ - 168;
  drawPanel(ctx, pX, pY, pW, pH, 26);

  const cx = SQ / 2;
  ctx.textBaseline = 'alphabetic';

  // 로고: SETLIST.
  ctx.font = '800 104px Montserrat, Pretendard, sans-serif';
  const slW = ctx.measureText('SETLIST').width;
  const dotW = ctx.measureText('.').width;
  const logoX = cx - (slW + 2 + dotW) / 2;
  const logoY = 300;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SETLIST', logoX, logoY);
  ctx.fillStyle = '#E62D2D';
  ctx.fillText('.', logoX + slW + 2, logoY);

  ctx.textAlign = 'center';
  ctx.font = '700 22px Montserrat, Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('T O U C H E D', cx, logoY + 50);

  // 구분선
  ctx.strokeStyle = '#E62D2D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 26, logoY + 92);
  ctx.lineTo(cx + 26, logoY + 92);
  ctx.stroke();

  // 안내 문구
  ctx.font = '700 46px Pretendard, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('다른 공연 세트리스트와 통계는', cx, logoY + 182);
  ctx.fillText('사이트에서 확인하세요', cx, logoY + 246);

  // 기능 칩: 공연 캘린더 · 곡 아카이브 · 통계
  const chips = ['공연 캘린더', '곡 아카이브', '통계'];
  ctx.font = '600 26px Pretendard, sans-serif';
  const chipPadX = 26, chipH = 56, chipGap = 16;
  const chipWs = chips.map(c => ctx.measureText(c).width + chipPadX * 2);
  const chipsTotal = chipWs.reduce((a, b) => a + b, 0) + chipGap * (chips.length - 1);
  let chipX = cx - chipsTotal / 2;
  const chipY = logoY + 300;
  chips.forEach((label, i) => {
    const w = chipWs[i];
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRectPath(ctx, chipX, chipY, w, chipH, chipH / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, chipX, chipY, w, chipH, chipH / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(label, chipX + w / 2, chipY + chipH / 2 + 9);
    chipX += w + chipGap;
  });

  // 사이트 주소 버튼
  const urlText = `${SITE_LABEL}  →`;
  ctx.font = '700 34px JetBrains Mono, monospace';
  const btnW = Math.min(pW - 80, ctx.measureText(urlText).width + 96);
  const btnH = 96;
  const btnX = cx - btnW / 2;
  const btnY = chipY + chipH + 64;
  ctx.save();
  ctx.shadowColor = 'rgba(230,45,45,0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#E62D2D';
  roundRectPath(ctx, btnX, btnY, btnW, btnH, 20);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(urlText, cx, btnY + btnH / 2 + 12);

  // 브랜딩
  ctx.font = '700 18px Montserrat, Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillText('SETLIST.TOUCHED', cx, pY + pH - 40);

  ctx.textAlign = 'left';
  return canvas.toDataURL('image/png');
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url.startsWith('data:')
        ? url
        : `/api/poster-proxy?url=${encodeURIComponent(url)}&t=${Date.now()}`;
    });
  } catch {
    return null;
  }
}

export const YOUTUBE_SLIDE_SUFFIXES = ['cover', 'setlist', 'more'] as const;

// 유튜브 커뮤니티 게시글용 정방형 이미지 3장: [커버, 세트리스트(트위터 이미지와 동일 디자인), 사이트 안내]
export async function createYoutubeSlides(opts: {
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  city: string | null;
  posterurl: string | null;
  songs: PosterSongInput[];
}): Promise<string[]> {
  const img = opts.posterurl ? await loadImage(opts.posterurl) : null;
  const cover = drawCoverSlide(img, opts);
  const setlist = renderSetlistPoster(
    img,
    { performanceTitle: opts.performanceTitle, performanceDate: opts.performanceDate, songs: opts.songs },
    { width: SQ, height: SQ },
  );
  const outro = drawOutroSlide(img);
  return [cover, setlist, outro];
}
