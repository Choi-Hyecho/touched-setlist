'use client';

import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import Image from 'next/image';
import { Disc3, Music } from 'lucide-react';
import SongModal from '@/components/SongModal';
import type { Song } from '@/types/database.types';

// ── Types ─────────────────────────────────────────────────────
interface AlbumWithSongs {
  id: string;
  title: string;
  albumtype: string | null;
  releasedate: string | null;
  albumarturl: string | null;
  songs: Song[];
}

type SongWithAlbum = Omit<Song, 'albums'> & {
  albums?: { albumarturl: string | null; title: string | null; releasedate: string | null } | null;
};

function releaseYear(date: string | null): string {
  if (!date) return '';
  return String(new Date(date).getFullYear());
}

// ── AlbumCard ─────────────────────────────────────────────────
function AlbumCard({
  album,
  selected,
  onClick,
}: {
  album: AlbumWithSongs;
  selected: boolean;
  onClick: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isIdle = tilt.x === 0 && tilt.y === 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * -11, y: nx * 11 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // 광택 각도가 틸트에 따라 이동
  const sheenAngle = 145 + tilt.y * 3;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="text-left w-full focus:outline-none"
      style={{
        transform: `perspective(420px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isIdle
          ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'transform 0.07s linear',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* CD 케이스 — padding-bottom으로 완전한 정사각형 보장 */}
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
      <div
        className="absolute inset-0 overflow-hidden rounded-[2px] transition-all duration-300 ease-out"
        style={{
          transform: selected ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
          boxShadow: selected
            ? '0 20px 48px rgba(230,45,45,0.28), 0 8px 24px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.18)'
            : `0 ${5 + Math.abs(tilt.x) * 0.6}px ${18 + Math.abs(tilt.x) * 1.2}px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}
      >
        {/* 앨범 아트 */}
        {album.albumarturl ? (
          <Image
            src={album.albumarturl}
            alt={album.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 30vw, 160px"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 100%)' }}
          >
            <Music className="w-7 h-7 text-white/15" />
          </div>
        )}

        {/* 플라스틱 광택 — 틸트에 반응 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${sheenAngle}deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 20%, transparent 50%, rgba(0,0,0,0.12) 100%)`,
            transition: isIdle ? 'background 0.5s ease' : 'background 0.07s linear',
          }}
        />

        {/* 좌측 척추 음영 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px] pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
        />

        {/* 상단 엣지 */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        />

        {/* 하단 어둠 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        />

        {/* 선택 시 레드 테두리 */}
        {selected && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: '1.5px solid rgba(230,45,45,0.6)', borderRadius: '2px' }}
          />
        )}
      </div>
      </div>

      {/* 앨범 정보 */}
      <div className="mt-2 px-0.5">
        <p
          className="text-[11px] font-semibold leading-snug"
          style={{
            color: selected ? '#F05A5A' : 'rgba(255,255,255,0.72)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.2s',
            height: '2.75em',
          }}
        >
          {album.title}
        </p>
        <p
          className="text-[10px] mt-0.5"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.28)' }}
        >
          {releaseYear(album.releasedate)}
        </p>
      </div>

      {/* 선택 인디케이터 삼각형 */}
      <div
        className="flex justify-center mt-1.5 transition-opacity duration-200"
        style={{ opacity: selected ? 1 : 0 }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(230,45,45,0.5)',
          }}
        />
      </div>
    </button>
  );
}

// ── TracklistPanel ─────────────────────────────────────────────
// displayAlbum을 로컬 상태로 유지해서 닫힘 애니메이션 중에도 내용 유지
function TracklistPanel({
  album,
  isOpen,
  onSongClick,
}: {
  album: AlbumWithSongs | null;
  isOpen: boolean;
  onSongClick: (song: SongWithAlbum) => void;
}) {
  const [displayAlbum, setDisplayAlbum] = useState<AlbumWithSongs | null>(album);

  useEffect(() => {
    if (album !== null) setDisplayAlbum(album);
  }, [album]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: isOpen ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        {displayAlbum && (
          <div className="pb-4 pt-1">
            <div
              className="rounded-2xl overflow-hidden border border-white/[0.07]"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {/* 패널 헤더 */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]"
                style={{ background: 'rgba(230,45,45,0.05)' }}
              >
                {displayAlbum.albumarturl && (
                  <div
                    className="relative w-9 h-9 rounded overflow-hidden flex-shrink-0"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    <Image src={displayAlbum.albumarturl} alt={displayAlbum.title} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{displayAlbum.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
                    {releaseYear(displayAlbum.releasedate)}
                    {displayAlbum.albumtype && <span className="ml-1.5">{displayAlbum.albumtype}</span>}
                    <span className="ml-1.5">· {displayAlbum.songs.length}곡</span>
                  </p>
                </div>
              </div>

              {/* 트랙 목록 */}
              <div className="divide-y divide-white/[0.04]">
                {displayAlbum.songs.map((song, idx) => {
                  const songWithAlbum: SongWithAlbum = {
                    ...song,
                    albums: {
                      albumarturl: displayAlbum.albumarturl,
                      title: displayAlbum.title,
                      releasedate: displayAlbum.releasedate,
                    },
                  };
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => onSongClick(songWithAlbum)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
                    >
                      <span
                        className="w-5 text-right flex-shrink-0"
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(230,45,45,0.45)',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm flex-1 truncate" style={{ color: 'rgba(255,255,255,0.78)' }}>
                        {song.title}
                      </span>
                      <span className="text-white/20 text-sm flex-shrink-0">›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function SongsPage() {
  const [albums, setAlbums]   = useState<AlbumWithSongs[]>([]);
  const [others, setOthers]   = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [numCols, setNumCols] = useState(3);

  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithSongs | null>(null);
  const [panelAlbum, setPanelAlbum]       = useState<AlbumWithSongs | null>(null);
  const [panelRowIdx, setPanelRowIdx]     = useState(-1);
  const [panelOpen, setPanelOpen]         = useState(false);

  const [modalSong, setModalSong] = useState<SongWithAlbum | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 컨테이너 너비로 열 수 결정
  useEffect(() => {
    const update = () => {
      setNumCols(window.innerWidth >= 640 ? 4 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    fetch('/api/discography')
      .then(r => r.json())
      .then(({ albums, others }) => {
        setAlbums((albums ?? []).filter((a: AlbumWithSongs) => a.songs.length > 0));
        setOthers(others ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 앨범을 행으로 나눔
  const albumRows = useMemo(() => {
    const rows: AlbumWithSongs[][] = [];
    for (let i = 0; i < albums.length; i += numCols) {
      rows.push(albums.slice(i, i + numCols));
    }
    return rows;
  }, [albums, numCols]);

  // 열 수 변경 시 패널 행 위치 재계산
  useEffect(() => {
    if (selectedAlbum) {
      const idx = albumRows.findIndex(row => row.some(a => a.id === selectedAlbum.id));
      if (idx !== -1) setPanelRowIdx(idx);
    }
  }, [albumRows, selectedAlbum]);

  const handleAlbumClick = (album: AlbumWithSongs) => {
    const newRowIdx = albumRows.findIndex(row => row.some(a => a.id === album.id));

    if (selectedAlbum?.id === album.id) {
      // 같은 앨범 — 닫기
      setSelectedAlbum(null);
      setPanelOpen(false);
      setTimeout(() => { setPanelAlbum(null); setPanelRowIdx(-1); }, 420);
    } else {
      setSelectedAlbum(album);
      setPanelAlbum(album);
      setPanelRowIdx(newRowIdx);
      setPanelOpen(true);
    }
  };

  const handleSongClick = (song: SongWithAlbum) => {
    setModalSong(song);
    setModalOpen(true);
  };

  return (
    <div className="page-container max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <h1
          className="text-sm font-bold uppercase tracking-[0.3em] text-white"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Songs<span className="text-touched-primary">.</span>
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div
                className="rounded-[2px] animate-pulse"
                style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.06)' }}
              />
              <div
                className="h-2.5 rounded animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)', width: '65%' }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {albums.length > 0 && (
            <div ref={containerRef}>
              {albumRows.map((row, rowIdx) => (
                <Fragment key={rowIdx}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 mb-5">
                    {row.map(album => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        selected={selectedAlbum?.id === album.id}
                        onClick={() => handleAlbumClick(album)}
                      />
                    ))}
                  </div>
                  {/* 이 행에 해당하는 트랙리스트 패널 */}
                  <TracklistPanel
                    album={panelRowIdx === rowIdx ? panelAlbum : null}
                    isOpen={panelOpen && panelRowIdx === rowIdx}
                    onSongClick={handleSongClick}
                  />
                </Fragment>
              ))}
            </div>
          )}

          {/* 기타 */}
          {others.length > 0 && (
            <div className="space-y-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)' }}
              >
                기타
              </p>
              <div
                className="rounded-2xl overflow-hidden border border-white/[0.07]"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="divide-y divide-white/[0.04]">
                  {others.map((song, idx) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => handleSongClick({ ...song, albums: null })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
                    >
                      <span
                        className="w-5 text-right flex-shrink-0"
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(230,45,45,0.4)',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm flex-1 truncate" style={{ color: 'rgba(255,255,255,0.78)' }}>
                        {song.title}
                      </span>
                      <span className="text-white/20 text-sm flex-shrink-0">›</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {albums.length === 0 && others.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Disc3 className="w-10 h-10 text-white/10" />
              <p className="text-sm text-muted">곡 정보가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {modalSong && (
        <SongModal
          song={modalSong as any}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
