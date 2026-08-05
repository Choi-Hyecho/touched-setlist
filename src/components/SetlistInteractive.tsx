'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import SongModal from '@/components/SongModal';
import type { Song, Setlist } from '@/types/database.types';
import { getEncoreLabel, renderSetlistPoster } from '@/lib/setlistPoster';

interface Props {
  setlists: Array<Setlist & { songs?: Song & { albums?: { id: string; title: string; albumarturl: string | null } } }>;
  performanceTitle: string;
  performanceDate: string;
  posterurl: string | null;
  description: string | null;
  venue: string;
  city: string | null;
}

export default function SetlistInteractive({ setlists, performanceTitle, performanceDate, posterurl }: Props) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewBackground, setPreviewBackground] = useState<'poster' | 'photo'>('poster');
  const [userPhotoDataUrl, setUserPhotoDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterurlRef = useRef(posterurl);

  // 공연이 바뀌면 ref 갱신 + 이전 미리보기 상태 초기화
  useEffect(() => {
    posterurlRef.current = posterurl;
    setPreviewImageUrl(null);
    setUserPhotoDataUrl(null);
    setError(null);
  }, [posterurl, performanceDate]);

  useEffect(() => {
    if (!previewImageUrl) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewImageUrl]);

  const date = new Date(performanceDate);

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
    </>
  );
}
