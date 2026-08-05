import { format } from 'date-fns';
import {
  SITE_LABEL, getEncoreLabel, roundRectPath, wrapToTwoLines, fitTitleFontSize,
  type PosterSongInput,
} from '@/lib/setlistPoster';

const YT_CHUNK_SIZE = 5;
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

// 정방형(SQ×SQ) 배경 전체를 포스터로 채우되, 원본 비율은 흐린 백드롭으로만 사용해
// 잘리거나 늘어나 보이지 않게 한다. 실제 포스터는 drawContainCard로 별도 렌더링.
function drawBlurredBackdrop(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, SQ: number, dim: number) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, SQ, SQ);

  if (img) {
    const sourceRatio = img.width / img.height;
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
    if (sourceRatio > 1) { srcW = img.height; srcX = (img.width - srcW) / 2; }
    else if (sourceRatio < 1) { srcH = img.width; srcY = (img.height - srcH) / 2; }

    const pad = 80; // 블러 가장자리 투명 halo 방지용 오버드로우(정방형이라 비율 왜곡 없음)
    ctx.save();
    ctx.filter = 'blur(50px) brightness(0.5) saturate(1.05)';
    ctx.drawImage(img, srcX, srcY, srcW, srcH, -pad, -pad, SQ + pad * 2, SQ + pad * 2);
    ctx.restore();
  }

  ctx.fillStyle = `rgba(0,0,0,${dim})`;
  ctx.fillRect(0, 0, SQ, SQ);
}

// 원본 비율을 유지한 채(contain) 박스 안에 이미지를 그리고, 카드처럼 둥근 테두리+그림자를 씌운다.
// 잘리거나 늘어나지 않음 — 남는 공간은 투명(배경의 블러 백드롭이 비쳐 보임).
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

interface CoverOpts {
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  city: string | null;
}

// ── 유튜브 커뮤니티 게시글용 정방형(1080×1080) 커버 슬라이드 ──────────
function drawYoutubeCoverSlide(img: HTMLImageElement | null, opts: CoverOpts): string {
  const { performanceTitle, performanceDate, venue, city } = opts;
  const date = new Date(performanceDate);

  const SQ = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = SQ; canvas.height = SQ;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스 초기화 실패');

  drawBlurredBackdrop(ctx, img, SQ, 0.35);

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

  // 날짜
  const dateLine = `${format(date, 'yyyy.MM.dd')} (${WEEKDAYS_KO[date.getDay()]})`;
  ctx.font = '400 30px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(dateLine, SQ / 2, cursorY);
  cursorY += 30;

  ctx.strokeStyle = '#E62D2D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(SQ / 2 - 26, cursorY);
  ctx.lineTo(SQ / 2 + 26, cursorY);
  ctx.stroke();
  cursorY += 46;

  // 공연명 (최대 2줄)
  const titleMaxW = SQ - padX * 2 - 40;
  const titleFs = fitTitleFontSize(ctx, performanceTitle, titleMaxW, 52, 28);
  ctx.font = `700 ${titleFs}px Pretendard, sans-serif`;
  const titleLines = wrapToTwoLines(ctx, performanceTitle, titleMaxW);
  ctx.fillStyle = '#ffffff';
  const titleLineH = titleFs + 12;
  titleLines.forEach((line, i) => ctx.fillText(line, SQ / 2, cursorY + titleFs + i * titleLineH));
  cursorY += titleLines.length * titleLineH + 30;

  // 공연장 · 도시
  ctx.font = '500 26px Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(city ? `${venue} · ${city}` : venue, SQ / 2, cursorY);

  // 브랜딩
  ctx.font = '700 20px Montserrat, Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('SETLIST.TOUCHED', SQ / 2, SQ - 54);
  ctx.font = '400 17px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.26)';
  ctx.fillText(SITE_LABEL, SQ / 2, SQ - 30);

  ctx.textAlign = 'left';
  return canvas.toDataURL('image/png');
}

// ── 유튜브용 세트리스트 슬라이드 (한 장당 최대 YT_CHUNK_SIZE곡) ────────
function drawYoutubeSetlistSlide(
  items: PosterSongInput[],
  startIndex: number,
  pageIndex: number,
  totalPages: number,
  img: HTMLImageElement | null,
): string {
  const SQ = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = SQ; canvas.height = SQ;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스 초기화 실패');

  drawBlurredBackdrop(ctx, img, SQ, 0.6);

  const padX = 84;
  const pX = padX, pY = 84, pW = SQ - padX * 2, pH = SQ - pY - 84;
  const pR = 26;

  const pGrad = ctx.createLinearGradient(pX, pY, pX, pY + pH);
  pGrad.addColorStop(0, 'rgba(22,22,22,0.92)');
  pGrad.addColorStop(1, 'rgba(10,10,10,0.90)');
  ctx.fillStyle = pGrad;
  roundRectPath(ctx, pX, pY, pW, pH, pR);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pX, pY, pW, pH, pR);
  ctx.stroke();

  ctx.save();
  roundRectPath(ctx, pX, pY, pW, pH, pR);
  ctx.clip();
  ctx.fillStyle = '#E62D2D';
  ctx.fillRect(pX, pY, pW, 6);
  ctx.restore();

  const innerPad = 56;
  const left = pX + innerPad;
  const right = pX + pW - innerPad;
  const maxW = right - left;

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = '800 58px Montserrat, Pretendard, sans-serif';
  const slW = ctx.measureText('SETLIST').width;
  const headerY = pY + 56;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SETLIST', left, headerY);
  ctx.fillStyle = '#E62D2D';
  ctx.fillText('.', left + slW + 2, headerY);

  ctx.textAlign = 'right';
  ctx.font = '600 26px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`${pageIndex + 1} / ${totalPages}`, right, headerY + 18);

  let y = headerY + 58 + 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
  ctx.strokeStyle = '#E62D2D';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + 52, y); ctx.stroke();
  y += 24;

  const listBottom = pY + pH - 66;
  const listArea = listBottom - y;
  const rowCount = YT_CHUNK_SIZE;
  const lh = listArea / rowCount;

  const numCellW = 76;
  const titleCellW = maxW - numCellW;
  const fs = 40;
  const numFs = 32;
  const tagFs = Math.round(fs * 0.55);

  const usedHeight = items.length * lh;
  const startY = y + (listArea - usedHeight) / 2;

  items.forEach((item, i) => {
    const iy = startY + i * lh;
    const globalIdx = startIndex + i;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, iy + lh - 1);
    ctx.lineTo(right, iy + lh - 1);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(left + numCellW, iy + lh * 0.2);
    ctx.lineTo(left + numCellW, iy + lh * 0.8);
    ctx.stroke();

    const encL = getEncoreLabel(item.notes);
    const isEnc = !!encL;
    const prefix = encL ?? `${globalIdx + 1}`;

    ctx.textAlign = 'center';
    ctx.font = `700 ${numFs}px JetBrains Mono, monospace`;
    ctx.fillStyle = isEnc ? 'rgba(255,190,50,0.85)' : 'rgba(230,45,45,0.7)';
    ctx.fillText(prefix, left + numCellW / 2, iy + (lh - numFs) / 2);

    const songTitle = item.title;
    const albumName = item.albumTitle;
    const tagLabel = (albumName === '미발매곡' || albumName === '커버곡') ? `(${albumName})` : null;
    const songLeft = left + numCellW + 20;
    const songMaxW = titleCellW - 20;

    ctx.font = `600 ${fs}px Pretendard, sans-serif`;
    const lines = wrapToTwoLines(ctx, songTitle, songMaxW);
    const lineH = fs + 6;
    const totalH = lines.length * lineH;
    const textY = iy + (lh - totalH) / 2;

    lines.forEach((line, li) => {
      ctx.font = `600 ${fs}px Pretendard, sans-serif`;
      ctx.fillStyle = '#f2f2f2';
      ctx.textAlign = 'left';
      ctx.fillText(line, songLeft, textY + li * lineH);

      if (tagLabel && li === lines.length - 1) {
        const lineW = ctx.measureText(line).width;
        ctx.font = `700 ${tagFs}px Pretendard, sans-serif`;
        ctx.fillStyle = albumName === '미발매곡' ? 'rgba(230,45,45,0.7)' : 'rgba(255,190,50,0.7)';
        ctx.fillText(tagLabel, songLeft + lineW + 8, textY + li * lineH + (fs - tagFs) / 2);
      }
    });
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 18px Montserrat, Pretendard, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillText('SETLIST.TOUCHED', pX + pW / 2, pY + pH - 46);
  ctx.font = '400 15px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillText(SITE_LABEL, pX + pW / 2, pY + pH - 24);

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

// 유튜브 커뮤니티 게시글용 이미지 세트를 생성한다: [커버, 세트리스트 1페이지, 2페이지, ...]
// 세트리스트는 한 장당 YT_CHUNK_SIZE(5)곡씩 나뉜다.
export async function createYoutubeSlides(opts: {
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  city: string | null;
  posterurl: string | null;
  songs: PosterSongInput[];
}): Promise<string[]> {
  const img = opts.posterurl ? await loadImage(opts.posterurl) : null;
  const cover = drawYoutubeCoverSlide(img, opts);

  const chunks: PosterSongInput[][] = [];
  for (let i = 0; i < opts.songs.length; i += YT_CHUNK_SIZE) {
    chunks.push(opts.songs.slice(i, i + YT_CHUNK_SIZE));
  }
  const totalPages = chunks.length;
  const pages = chunks.map((chunk, idx) =>
    drawYoutubeSetlistSlide(chunk, idx * YT_CHUNK_SIZE, idx, totalPages, img)
  );

  return [cover, ...pages];
}
