import { format } from 'date-fns';
import { SITE_URL } from '@/lib/constants';

export const SITE_LABEL = SITE_URL.replace(/^https?:\/\//, '');

export interface PosterSongInput {
  title: string;
  albumTitle?: string | null;
  notes?: string | null;
}

export function getEncoreLabel(notes?: string | null) {
  if (!notes) return null;
  const match = notes.match(/(?:앵콜|encore|E)\s*(\d+)/i);
  return match ? `E${match[1]}` : null;
}

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function wrapToTwoLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (ctx.measureText(text).width <= maxW) return [text];

  const words = text.split(' ');
  if (words.length > 1) {
    // 단어 경계 기준으로 line1에 최대한 채우기
    let line1 = words[0];
    let i = 1;
    while (i < words.length - 1 && ctx.measureText(line1 + ' ' + words[i]).width <= maxW) {
      line1 += ' ' + words[i];
      i++;
    }
    const line2 = words.slice(i).join(' ');
    if (ctx.measureText(line2).width <= maxW) return [line1, line2];
    // line2 still too long → word-boundary truncate
    const l2w = line2.split(' ');
    while (l2w.length > 1 && ctx.measureText(l2w.join(' ') + '…').width > maxW) l2w.pop();
    return [line1, l2w.join(' ') + '…'];
  }

  // 단어가 하나뿐 → 글자 단위 break
  let l1 = '';
  for (const ch of text) {
    if (ctx.measureText(l1 + ch).width > maxW) break;
    l1 += ch;
  }
  const l2raw = text.slice(l1.length);
  if (ctx.measureText(l2raw).width <= maxW) return [l1, l2raw];
  let l2 = l2raw;
  while (l2.length > 1 && ctx.measureText(l2 + '…').width > maxW) l2 = l2.slice(0, -1);
  return [l1, l2 + '…'];
}

export function fitTitleFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
) {
  if (!text.trim()) return maxSize;
  let size = maxSize;
  while (size >= minSize) {
    ctx.font = `600 ${size}px Pretendard, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

// 세로형(1080×1620) 세트리스트 포스터 렌더링. 사이트 "이미지 저장" 기능과 트위터 자동 게시
// 첨부 이미지가 이 함수 하나를 공유해서, 두 곳의 결과물이 항상 동일하게 유지된다.
export function renderSetlistPoster(
  img: HTMLImageElement | null,
  opts: { performanceTitle: string; performanceDate: string; songs: PosterSongInput[] },
): string {
  const { performanceTitle, performanceDate, songs } = opts;
  const date = new Date(performanceDate);

  const W = 1080, H = 1620;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스 초기화 실패');

  // ── background ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  if (img) {
    const targetRatio = W / H;
    const sourceRatio = img.width / img.height;
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
    if (sourceRatio > targetRatio) { srcW = img.height * targetRatio; srcX = (img.width - srcW) / 2; }
    else if (sourceRatio < targetRatio) { srcH = img.width / targetRatio; srcY = (img.height - srcH) / 2; }
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, W, H);
  }

  // Overlay — 하단 완전 불투명하게
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   'rgba(0,0,0,0.50)');
  grad.addColorStop(0.7, 'rgba(0,0,0,0.80)');
  grad.addColorStop(1,   'rgba(0,0,0,0.97)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── panel (92% height) ───────────────────────────────────────────────────
  const pW = Math.round(W * 0.84);
  const pH = Math.round(H * 0.92);
  const pX = Math.round((W - pW) / 2);
  const pY = Math.round((H - pH) / 2);
  const pR = 28;

  const pGrad = ctx.createLinearGradient(pX, pY, pX, pY + pH);
  pGrad.addColorStop(0, 'rgba(22,22,22,0.94)');
  pGrad.addColorStop(1, 'rgba(10,10,10,0.92)');
  ctx.fillStyle = pGrad;
  roundRectPath(ctx, pX, pY, pW, pH, pR);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pX, pY, pW, pH, pR);
  ctx.stroke();

  // Red accent bar at top
  ctx.save();
  roundRectPath(ctx, pX, pY, pW, pH, pR);
  ctx.clip();
  ctx.fillStyle = '#E62D2D';
  ctx.fillRect(pX, pY, pW, 6);
  ctx.restore();

  // ── typography setup ─────────────────────────────────────────────────────
  // 10곡 이하 → 1단(padX 64) / 11곡 이상 → 2단(padX 44, 좌우 여백 축소)
  const n = songs.length;
  const use2Col = n > 10;
  const padX = use2Col ? 44 : 64;
  const tLeft = pX + padX;
  const tRight = pX + pW - padX;
  const maxW = pW - padX * 2;
  ctx.textBaseline = 'top';

  // SETLIST. 너비 측정 (right column 기준점)
  ctx.font = '800 82px Montserrat, Pretendard, sans-serif';
  const slW = ctx.measureText('SETLIST').width;

  // 오른쪽 컬럼 타이틀 크기
  const rightColW = tRight - (tLeft + slW + ctx.measureText('.').width + 32);
  const titleSize = fitTitleFontSize(ctx, performanceTitle, rightColW, 30, 12);

  // 헤더 행 높이 = SETLIST. 폰트(82px) 기준 (조금 더 여유)
  const headerRowH = 96;
  const topPad = 72;
  // listArea = pH - topPad - headerRow - gap - dividerGap - branding
  const listArea = Math.max(200, pH - topPad - headerRowH - 22 - 28 - 74);
  const rowCount = use2Col ? Math.ceil(n / 2) : n;
  // lh = listArea 가득 채우도록, fs = 항상 2줄 wrap 가능하게
  const lh = Math.max(44, Math.min(200, Math.floor(listArea / Math.max(1, rowCount))));
  const fs = Math.max(22, Math.min(use2Col ? 52 : 72, Math.floor((lh - 8) / 2.3)));
  const maxItems = use2Col ? rowCount * 2 : rowCount;

  let y = pY + topPad;

  // ── 왼쪽: SETLIST. ──────────────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.font = '800 82px Montserrat, Pretendard, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SETLIST', tLeft, y);
  ctx.fillStyle = '#E62D2D';
  ctx.fillText('.', tLeft + slW + 2, y);

  // ── 오른쪽: 날짜 + 공연명 (우측 정렬) ──────────────────────────────────
  const rightH = 26 + 10 + titleSize;
  const rightY = y + Math.max(0, (headerRowH - rightH) / 2);

  ctx.textAlign = 'right';
  ctx.font = '400 24px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(format(date, 'yyyy / MM / dd'), tRight, rightY);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `600 ${titleSize}px Pretendard, sans-serif`;
  const tW = ctx.measureText(performanceTitle).width;
  if (tW <= rightColW) {
    ctx.fillText(performanceTitle, tRight, rightY + 26 + 10);
  } else {
    ctx.save();
    ctx.translate(tRight, rightY + 26 + 10);
    ctx.scale(rightColW / tW, 1);
    ctx.textAlign = 'right';
    ctx.fillText(performanceTitle, 0, 0);
    ctx.restore();
    ctx.textAlign = 'right';
  }

  y += headerRowH + 22;

  // ── divider ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(tLeft, y); ctx.lineTo(tRight, y); ctx.stroke();
  ctx.strokeStyle = '#E62D2D';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(tLeft, y); ctx.lineTo(tLeft + 52, y); ctx.stroke();
  y += 28;

  // ── song list ────────────────────────────────────────────────────────────
  const numCellW   = use2Col ? 52 : 68;
  const colGap     = use2Col ? 24 : 0;
  const colW       = use2Col ? (maxW - colGap) / 2 : maxW;
  const titleCellW = colW - numCellW;
  const numFs      = Math.max(14, Math.min(52, Math.round(fs * 0.78)));
  const tagFs      = Math.round(fs * 0.58);
  const visibleItems = songs.slice(0, maxItems);

  const drawSongRow = (item: PosterSongInput, globalIdx: number, colX: number, row: number) => {
    const iy = y + row * lh;

    // 행 하단 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(colX, iy + lh - 1);
    ctx.lineTo(colX + colW, iy + lh - 1);
    ctx.stroke();

    // 번호 열 세로 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.moveTo(colX + numCellW, iy + lh * 0.2);
    ctx.lineTo(colX + numCellW, iy + lh * 0.8);
    ctx.stroke();

    const encL   = getEncoreLabel(item.notes);
    const isEnc  = !!encL;
    const prefix = encL ?? `${globalIdx + 1}`;

    // 번호
    ctx.textAlign = 'center';
    ctx.font = `700 ${numFs}px JetBrains Mono, monospace`;
    ctx.fillStyle = isEnc ? 'rgba(255,190,50,0.8)' : 'rgba(230,45,45,0.65)';
    ctx.fillText(prefix, colX + numCellW / 2, iy + (lh - numFs) / 2);

    // 제목
    const songTitle = item.title;
    const albumName = item.albumTitle;
    const tagLabel  = (albumName === '미발매곡' || albumName === '커버곡') ? `(${albumName})` : null;
    const songLeft  = colX + numCellW + 12;
    const songMaxW2 = titleCellW - 12;

    // 제목은 tagW 고려 없이 전체 폭으로 wrap (짧은 제목이 억지로 쪼개지는 것 방지)
    ctx.font = `500 ${fs}px Pretendard, sans-serif`;
    const lines = wrapToTwoLines(ctx, songTitle, songMaxW2);
    const lineH  = fs + 4;
    const totalH = lines.length * lineH;
    const textY  = iy + (lh - totalH) / 2;

    lines.forEach((line, li) => {
      ctx.font = `500 ${fs}px Pretendard, sans-serif`;
      ctx.fillStyle = '#eeeeee';
      ctx.textAlign = 'left';
      ctx.fillText(line, songLeft, textY + li * lineH);

      if (tagLabel && li === lines.length - 1) {
        const lineW = ctx.measureText(line).width;
        ctx.font = `700 ${tagFs}px Pretendard, sans-serif`;
        ctx.fillStyle = albumName === '미발매곡' ? 'rgba(230,45,45,0.65)' : 'rgba(255,190,50,0.65)';
        ctx.fillText(tagLabel, songLeft + lineW + 8, textY + li * lineH + (fs - tagFs) / 2);
      }
    });
  };

  if (use2Col) {
    const leftItems  = visibleItems.slice(0, rowCount);
    const rightItems = visibleItems.slice(rowCount);
    const leftColX   = tLeft;
    const rightColX2 = tLeft + colW + colGap;

    leftItems.forEach((item, row) => drawSongRow(item, row, leftColX, row));
    rightItems.forEach((item, row) => drawSongRow(item, rowCount + row, rightColX2, row));

    // 두 열 사이 세로 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tLeft + colW + colGap / 2, y);
    ctx.lineTo(tLeft + colW + colGap / 2, y + rowCount * lh);
    ctx.stroke();
  } else {
    visibleItems.forEach((item, i) => drawSongRow(item, i, tLeft, i));
  }

  if (songs.length > maxItems) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `400 26px Pretendard, sans-serif`;
    ctx.fillText(`+ ${songs.length - maxItems} more`, pX + pW / 2, y + rowCount * lh + 10);
  }

  // ── branding ──────────────────────────────────────────────────────────────
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '700 20px Montserrat, Pretendard, sans-serif';
  ctx.fillText('SETLIST.TOUCHED', tRight, pY + pH - 54);

  ctx.fillStyle = 'rgba(255,255,255,0.24)';
  ctx.font = '400 17px JetBrains Mono, monospace';
  ctx.fillText(SITE_LABEL, tRight, pY + pH - 30);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return canvas.toDataURL('image/png');
}
