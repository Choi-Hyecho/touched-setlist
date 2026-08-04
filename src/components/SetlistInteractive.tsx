'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Download, X, GalleryHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import SongModal from '@/components/SongModal';
import type { Song, Setlist } from '@/types/database.types';
import {
  SITE_LABEL, getEncoreLabel, wrapToTwoLines, fitTitleFontSize, renderSetlistPoster,
} from '@/lib/setlistPoster';

interface Props {
  setlists: Array<Setlist & { songs?: Song & { albums?: { id: string; title: string; albumarturl: string | null } } }>;
  performanceTitle: string;
  performanceDate: string;
  posterurl: string | null;
  description: string | null;
  venue: string;
  city: string | null;
}

const YT_CHUNK_SIZE = 5;
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

export default function SetlistInteractive({ setlists, performanceTitle, performanceDate, posterurl, venue, city }: Props) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewBackground, setPreviewBackground] = useState<'poster' | 'photo'>('poster');
  const [userPhotoDataUrl, setUserPhotoDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterurlRef = useRef(posterurl);

  const [ytSlides, setYtSlides] = useState<string[] | null>(null);
  const [ytIndex, setYtIndex] = useState(0);
  const [ytGenerating, setYtGenerating] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  // 공연이 바뀌면 ref 갱신 + 이전 미리보기 상태 초기화
  useEffect(() => {
    posterurlRef.current = posterurl;
    setPreviewImageUrl(null);
    setUserPhotoDataUrl(null);
    setError(null);
    setYtSlides(null);
    setYtIndex(0);
    setYtError(null);
  }, [posterurl, performanceDate]);

  useEffect(() => {
    if (!previewImageUrl && !ytSlides) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewImageUrl]);

  const date = new Date(performanceDate);

  // ── 유튜브 커뮤니티 게시글용 정방형(1080×1080) 커버 슬라이드 ──────────
  const drawYoutubeCoverSlide = (img: HTMLImageElement | null) => {
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
  };

  // ── 유튜브용 세트리스트 슬라이드 (한 장당 최대 YT_CHUNK_SIZE곡) ────────
  const drawYoutubeSetlistSlide = (
    items: typeof setlists,
    startIndex: number,
    pageIndex: number,
    totalPages: number,
    img: HTMLImageElement | null,
  ) => {
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

      const songTitle = item.songs?.title ?? '알 수 없는 곡';
      const albumName = item.songs?.albums?.title;
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
  };

  const loadPosterImageForYoutube = async (): Promise<HTMLImageElement | null> => {
    const bgUrl = posterurlRef.current;
    if (!bgUrl) return null;
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.crossOrigin = 'anonymous';
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = bgUrl.startsWith('data:')
          ? bgUrl
          : `/api/poster-proxy?url=${encodeURIComponent(bgUrl)}&t=${Date.now()}`;
      });
    } catch {
      return null;
    }
  };

  const createYoutubeSlides = async (): Promise<string[]> => {
    const img = await loadPosterImageForYoutube();
    const cover = drawYoutubeCoverSlide(img);

    const chunks: (typeof setlists)[] = [];
    for (let i = 0; i < setlists.length; i += YT_CHUNK_SIZE) {
      chunks.push(setlists.slice(i, i + YT_CHUNK_SIZE));
    }
    const totalPages = chunks.length;
    const pages = chunks.map((chunk, idx) =>
      drawYoutubeSetlistSlide(chunk, idx * YT_CHUNK_SIZE, idx, totalPages, img)
    );

    return [cover, ...pages];
  };

  const createSetlistImageDataUrl = async (
    backgroundType: 'poster' | 'photo',
    customBgDataUrl?: string
  ) => {
    const bgUrl = backgroundType === 'photo'
      ? (customBgDataUrl ?? null)
      : (posterurlRef.current ?? null);

    let img: HTMLImageElement | null = null;
    if (bgUrl) {
      try {
        img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new window.Image();
          el.crossOrigin = 'anonymous';
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = bgUrl.startsWith('data:')
            ? bgUrl
            : `/api/poster-proxy?url=${encodeURIComponent(bgUrl)}&t=${Date.now()}`;
        });
      } catch {}
    }

    return renderSetlistPoster(img, {
      performanceTitle,
      performanceDate,
      songs: setlists.map(s => ({
        title: s.songs?.title ?? '알 수 없는 곡',
        albumTitle: s.songs?.albums?.title ?? null,
        notes: s.notes ?? null,
      })),
    });
  };

  const triggerDownload = (dataUrl: string, suffix?: string) => {
    const link = document.createElement('a');
    const safeTitle = performanceTitle.replace(/[\\/:*?"<>|]/g, '').slice(0, 30);
    const base = `setlist-${format(date, 'yyyyMMdd')}-${safeTitle || 'performance'}`;
    link.download = suffix ? `${base}-${suffix}.png` : `${base}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleOpenPreview = async () => {
    setError(null);
    setPreviewBackground('poster');
    setDownloading(true);
    try {
      const dataUrl = await createSetlistImageDataUrl('poster');
      if (dataUrl) setPreviewImageUrl(dataUrl);
    } catch {
      setError('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePosterTab = async () => {
    setPreviewBackground('poster');
    setDownloading(true);
    try {
      const dataUrl = await createSetlistImageDataUrl('poster');
      if (dataUrl) setPreviewImageUrl(dataUrl);
    } catch {
      setError('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setUserPhotoDataUrl(dataUrl);
      setPreviewBackground('photo');
      setDownloading(true);
      try {
        const imageUrl = await createSetlistImageDataUrl('photo', dataUrl);
        if (imageUrl) setPreviewImageUrl(imageUrl);
      } catch {
        setError('이미지 생성 중 오류가 발생했습니다.');
      } finally {
        setDownloading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDownload = () => {
    if (!previewImageUrl) return;
    triggerDownload(previewImageUrl);
    setPreviewImageUrl(null);
  };

  const handleOpenYoutubePreview = async () => {
    setYtError(null);
    setYtGenerating(true);
    try {
      const slides = await createYoutubeSlides();
      setYtSlides(slides);
      setYtIndex(0);
    } catch {
      setYtError('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setYtGenerating(false);
    }
  };

  const ytSlideSuffix = (i: number) => (i === 0 ? 'yt-cover' : `yt-set${i}`);

  const handleDownloadCurrentYoutube = () => {
    if (!ytSlides) return;
    triggerDownload(ytSlides[ytIndex], ytSlideSuffix(ytIndex));
  };

  const handleDownloadAllYoutube = () => {
    if (!ytSlides) return;
    ytSlides.forEach((dataUrl, i) => {
      setTimeout(() => triggerDownload(dataUrl, ytSlideSuffix(i)), i * 300);
    });
  };

  const handleCloseYoutubePreview = () => {
    setYtSlides(null);
    setYtIndex(0);
    setYtError(null);
  };

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <Music className="w-4 h-4 text-touched-primary" />
            Setlist
            {setlists.length > 0 && (
              <span
                className="text-xs font-normal ml-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a7a7a7' }}
              >
                {setlists.length} tracks
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={downloading || setlists.length === 0}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? '생성 중...' : '이미지 저장'}
            </button>
            <button
              type="button"
              onClick={handleOpenYoutubePreview}
              disabled={ytGenerating || setlists.length === 0}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GalleryHorizontal className="w-3.5 h-3.5" />
              {ytGenerating ? '생성 중...' : '유튜브용'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        {ytError && <p className="text-red-400 text-xs mb-3">{ytError}</p>}

        {setlists.length === 0 ? (
          <p className="text-muted text-center py-10 text-sm">등록된 세트리스트가 없습니다.</p>
        ) : (
          <div className="space-y-1">
            {setlists.map((setlist, idx) => {
              const song = setlist.songs;
              const albumTitle = song?.albums?.title ?? null;
              const encoreLabel = getEncoreLabel(setlist.notes);
              return (
                <button
                  key={setlist.id}
                  onClick={() => song && setSelectedSong(song as Song)}
                  disabled={!song}
                  className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 border border-transparent group disabled:opacity-40 disabled:cursor-default hover:border-white/[0.08] hover:bg-white/[0.04]"
                >
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 group-hover:bg-touched-primary group-hover:text-white"
                    style={{ background: 'rgba(230,45,45,0.12)', color: '#F05A5A' }}
                  >
                    {encoreLabel ?? idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{song?.title ?? '알 수 없는 곡'}</p>
                    {albumTitle && <p className="text-sm text-muted/90 truncate leading-snug">{albumTitle}</p>}
                    {setlist.notes && !encoreLabel && <p className="text-sm text-muted/80 italic leading-snug">{setlist.notes}</p>}
                  </div>
                  {song && (
                    <span className="hidden sm:block text-xs text-white/15 group-hover:text-touched-primary transition-colors duration-200 flex-shrink-0">
                      스트리밍 →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSong && (
        <SongModal song={selectedSong} isOpen={!!selectedSong} onClose={() => setSelectedSong(null)} />
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {previewImageUrl && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setPreviewImageUrl(null)}
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="w-full sm:max-w-sm rounded-2xl sm:rounded-2xl border border-white/[0.1] flex flex-col"
              style={{ background: '#181818', maxHeight: '85dvh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 탭 */}
              <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-white/[0.08] flex-shrink-0">
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    onClick={handlePosterTab}
                    disabled={downloading}
                    className="flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-40"
                    style={previewBackground === 'poster'
                      ? { background: 'rgba(230,45,45,0.15)', borderColor: 'rgba(230,45,45,0.35)', color: '#F05A5A' }
                      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
                    }
                  >
                    포스터
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={downloading}
                    className="flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-40"
                    style={previewBackground === 'photo'
                      ? { background: 'rgba(230,45,45,0.15)', borderColor: 'rgba(230,45,45,0.35)', color: '#F05A5A' }
                      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
                    }
                  >
                    {userPhotoDataUrl ? '내 사진 ✓' : '내 사진'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(null)}
                  className="ml-3 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 이미지 */}
              <div className="p-4">
                <img
                  src={previewImageUrl}
                  alt=""
                  className="block mx-auto h-auto rounded-xl border border-white/[0.08]"
                  style={{ maxHeight: '55dvh', maxWidth: '100%', WebkitTouchCallout: 'default' }}
                />
              </div>

              {/* 저장 버튼 */}
              <div className="px-4 pt-0 pb-5 flex-shrink-0">
                <button type="button" onClick={handleConfirmDownload} className="btn-primary w-full text-sm">
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {ytSlides && ytSlides.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={handleCloseYoutubePreview}
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="w-full sm:max-w-sm rounded-2xl border border-white/[0.1] flex flex-col"
              style={{ background: '#181818', maxHeight: '85dvh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-white/[0.08] flex-shrink-0">
                <p className="text-sm font-semibold text-white">
                  유튜브 게시글용 <span className="text-muted font-normal">({ytIndex + 1}/{ytSlides.length})</span>
                </p>
                <button
                  type="button"
                  onClick={handleCloseYoutubePreview}
                  className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 이미지 + 좌우 이동 */}
              <div className="p-4 relative">
                <img
                  src={ytSlides[ytIndex]}
                  alt=""
                  className="block mx-auto h-auto rounded-xl border border-white/[0.08]"
                  style={{ maxHeight: '50dvh', maxWidth: '100%', WebkitTouchCallout: 'default' }}
                />
                {ytIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setYtIndex(i => i - 1)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white bg-black/50 hover:bg-black/70 transition"
                    aria-label="이전"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {ytIndex < ytSlides.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setYtIndex(i => i + 1)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white bg-black/50 hover:bg-black/70 transition"
                    aria-label="다음"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 도트 인디케이터 */}
              <div className="flex items-center justify-center gap-1.5 pb-1">
                {ytSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setYtIndex(i)}
                    aria-label={`${i + 1}번째 이미지`}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i === ytIndex ? '#E62D2D' : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>

              {/* 저장 버튼 */}
              <div className="px-4 pt-3 pb-5 flex-shrink-0 flex gap-2">
                <button type="button" onClick={handleDownloadCurrentYoutube} className="btn-secondary flex-1 text-sm">
                  이 이미지 저장
                </button>
                <button type="button" onClick={handleDownloadAllYoutube} className="btn-primary flex-1 text-sm">
                  전체 저장 ({ytSlides.length}장)
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
