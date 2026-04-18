'use client';

import { useState, useRef } from 'react';
import { Music, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import SongModal from '@/components/SongModal';
import type { Song, Setlist } from '@/types/database.types';

interface Props {
  setlists: Array<Setlist & { songs?: Song & { albums?: { id: string; title: string; albumarturl: string | null } } }>;
  performanceTitle: string;
  performanceDate: string;
  posterurl: string | null;
  description: string | null;
}

function getEncoreLabel(notes?: string | null) {
  if (!notes) return null;
  const match = notes.match(/(?:앵콜|encore|E)\s*(\d+)/i);
  return match ? `E${match[1]}` : null;
}

export default function SetlistInteractive({ setlists, performanceTitle, performanceDate, posterurl }: Props) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewBackground, setPreviewBackground] = useState<'poster' | 'photo'>('poster');
  const [userPhotoDataUrl, setUserPhotoDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const date = new Date(performanceDate);

  const fitTitleFontSize = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxSize: number,
    minSize: number
  ) => {
    if (!text.trim()) return maxSize;
    let size = maxSize;
    while (size >= minSize) {
      ctx.font = `600 ${size}px Pretendard, sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) return size;
      size -= 1;
    }
    return minSize;
  };

  const createSetlistImageDataUrl = async (
    backgroundType: 'poster' | 'photo',
    customBgDataUrl?: string
  ) => {
    const W = 1080, H = 1620;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('캔버스 초기화 실패');

    // ── rounded rect helper ──────────────────────────────────────────────────
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
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
    };

    // ── background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    const bgUrl = backgroundType === 'photo'
      ? (customBgDataUrl ?? null)
      : (posterurl ?? null);

    if (bgUrl) {
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new window.Image();
          el.crossOrigin = 'anonymous';
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = bgUrl.startsWith('data:')
            ? bgUrl
            : `/api/poster-proxy?url=${encodeURIComponent(bgUrl)}`;
        });
        const targetRatio = W / H;
        const sourceRatio = img.width / img.height;
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
        if (sourceRatio > targetRatio) { srcW = img.height * targetRatio; srcX = (img.width - srcW) / 2; }
        else if (sourceRatio < targetRatio) { srcH = img.width / targetRatio; srcY = (img.height - srcH) / 2; }
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, W, H);
      } catch {}
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
    rr(pX, pY, pW, pH, pR);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5;
    rr(pX, pY, pW, pH, pR);
    ctx.stroke();

    // Red accent bar at top
    ctx.save();
    rr(pX, pY, pW, pH, pR);
    ctx.clip();
    ctx.fillStyle = '#E62D2D';
    ctx.fillRect(pX, pY, pW, 6);
    ctx.restore();

    // ── typography setup ─────────────────────────────────────────────────────
    // 헤더가 너무 타이트해 보이지 않도록 상단 여백을 조금 더 줌
    const padX = 64;
    const tLeft = pX + padX;
    const tRight = pX + pW - padX;
    const maxW = pW - padX * 2;
    ctx.textBaseline = 'top';

    // SETLIST. 너비 측정 (right column 기준점)
    ctx.font = '800 82px Montserrat, Pretendard, sans-serif';
    const slW = ctx.measureText('SETLIST').width;
    const dotW = ctx.measureText('.').width;
    const rightColX = tLeft + slW + dotW + 32;
    const rightColW = tRight - rightColX;

    // 오른쪽 컬럼 타이틀 크기
    const titleSize = fitTitleFontSize(ctx, performanceTitle, rightColW, 30, 12);

    // 헤더 행 높이 = SETLIST. 폰트(82px) 기준 (조금 더 여유)
    const headerRowH = 96;
    const topPad = 72;
    // listArea = pH - topPad - headerRow - gap - dividerGap - branding
    const listArea = Math.max(200, pH - topPad - headerRowH - 22 - 28 - 52);
    const lh = Math.max(44, Math.min(60, Math.floor(listArea / Math.max(1, setlists.length))));
    const fs = Math.max(24, Math.min(36, lh - 14));
    const maxItems = Math.max(1, Math.floor(listArea / lh));

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

    // ── song list ─────────────────────────────────────────────────────────────
    const numW = 56;
    const songLeft = tLeft + numW;
    const songMaxW = maxW - numW;

    setlists.slice(0, maxItems).forEach((item, i) => {
      const songTitle = item.songs?.title ?? '알 수 없는 곡';
      const encL = getEncoreLabel(item.notes);
      const isEnc = !!encL;
      const prefix = encL ?? `${i + 1}`;
      const iy = y + i * lh;

      // Number
      ctx.textAlign = 'right';
      ctx.font = `600 ${Math.round(fs * 0.72)}px JetBrains Mono, monospace`;
      ctx.fillStyle = isEnc ? 'rgba(255,190,50,0.75)' : 'rgba(230,45,45,0.6)';
      ctx.fillText(prefix, tLeft + numW - 10, iy + (lh - Math.round(fs * 0.72)) / 2);

      // Title
      ctx.textAlign = 'left';
      ctx.font = `500 ${fs}px Pretendard, sans-serif`;
      ctx.fillStyle = '#eeeeee';
      let t = songTitle;
      while (t.length > 0 && ctx.measureText(t).width > songMaxW) t = t.slice(0, -1);
      if (t !== songTitle) t += '…';
      ctx.fillText(t, songLeft, iy + (lh - fs) / 2);
    });

    if (setlists.length > maxItems) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = `400 26px Pretendard, sans-serif`;
      ctx.fillText(`+ ${setlists.length - maxItems} more`, pX + pW / 2, y + maxItems * lh + 10);
    }

    // ── branding ──────────────────────────────────────────────────────────────
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '700 20px Montserrat, Pretendard, sans-serif';
    ctx.fillText('SETLIST.TOUCHED', tRight, pY + pH - 32);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    return canvas.toDataURL('image/png');
  };

  const triggerDownload = (dataUrl: string) => {
    const link = document.createElement('a');
    const safeTitle = performanceTitle.replace(/[\\/:*?"<>|]/g, '').slice(0, 30);
    link.download = `setlist-${format(date, 'yyyyMMdd')}-${safeTitle || 'performance'}.png`;
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
          <button
            type="button"
            onClick={handleOpenPreview}
            disabled={downloading || setlists.length === 0}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? '생성 중...' : '이미지 저장'}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

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

          <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 pb-[env(safe-area-inset-bottom,16px)] sm:items-center sm:p-4">
            <div
              className="w-full sm:max-w-sm rounded-2xl sm:rounded-2xl border border-white/[0.1] flex flex-col"
              style={{ background: '#181818', maxHeight: '82dvh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 핸들 + 탭 */}
              <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-white/[0.08] flex-shrink-0">
                <div className="flex gap-2 flex-1">
                  {/* 포스터 탭 */}
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

                  {/* 내 사진 탭 — 클릭 시 파일 선택 */}
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
              <div className="overflow-y-auto flex-1 p-4">
                <img
                  src={previewImageUrl}
                  alt=""
                  className="w-full h-auto rounded-xl border border-white/[0.08]"
                  style={{ maxHeight: '55dvh', objectFit: 'contain' }}
                />
              </div>

              {/* 저장 버튼 */}
              <div className="p-4 pt-0 flex-shrink-0 pb-[env(safe-area-inset-bottom,16px)]">
                <button type="button" onClick={handleConfirmDownload} className="btn-primary w-full text-sm">
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
