'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Music, MapPin } from 'lucide-react';
import { SiYoutube, SiSpotify, SiApplemusic } from 'react-icons/si';
import type { Song } from '@/types/database.types';
import { getEncoreLabel } from '@/lib/setlistPoster';

interface SongModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

interface YearStat {
  year: number;
  count: number;
  lastPerf: { id: string; title: string; date: string } | null;
}

interface PerformanceItem {
  id: string;
  title: string;
  date: string;
  venue: string | null;
  city: string | null;
  order: number | null;
  notes: string | null;
}

interface SongStats {
  years: YearStat[];
  lastPerfOverall: { id: string; title: string; date: string } | null;
  performances?: PerformanceItem[];
}

type ModalTab = 'info' | 'history';

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd} (${WEEKDAYS_KO[d.getDay()]})`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function daysSince(iso: string): number {
  const last = new Date(iso);
  last.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SongModal({ song, isOpen, onClose }: SongModalProps) {
  const [stats, setStats] = useState<SongStats | null>(null);
  const [tab, setTab] = useState<ModalTab>('info');

  useEffect(() => {
    if (!isOpen) return;
    setStats(null);
    setTab('info');
    fetch(`/api/stats/song?id=${song.id}&year=${new Date().getFullYear()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setStats(data))
      .catch(() => {});
  }, [isOpen, song.id]);

  if (!isOpen) return null;

  const albumArtUrl   = (song as any).albums?.albumarturl ?? null;
  const albumTitle    = (song as any).albums?.title ?? null;
  const releaseYear   = (song as any).albums?.releasedate
    ? new Date((song as any).albums.releasedate).getFullYear()
    : null;

  const streamingLinks: {
    name: string;
    url: string | null | undefined;
    icon: React.ReactNode;
    color: string;
  }[] = [
    { name: 'YouTube',     url: song.youtubeurl,    icon: <SiYoutube className="w-3.5 h-3.5" />,    color: '#FF4444' },
    { name: 'Spotify',     url: song.spotifyurl,    icon: <SiSpotify className="w-3.5 h-3.5" />,    color: '#1DB954' },
    { name: 'Apple Music', url: song.applemusicurl, icon: <SiApplemusic className="w-3.5 h-3.5" />, color: '#f8f8f8' },
    { name: 'Melon',       url: song.melonurl,      icon: <img src="/icons/melon.svg"  alt="" width={14} height={14} className="rounded-sm" />, color: '#00CD3C' },
    { name: 'Genie',       url: song.genieurl,      icon: <img src="/icons/genie.svg"  alt="" width={14} height={14} className="rounded-sm" />, color: '#4D9FFF' },
    { name: 'Bugs',        url: song.bugsurl,       icon: <img src="/icons/bugs.svg"   alt="" width={14} height={14} className="rounded-sm" />, color: '#FC7A40' },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        role="presentation"
      />

      <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
        <div
          className="w-full max-w-sm rounded-2xl border border-white/[0.08] pointer-events-auto overflow-hidden"
          style={{ background: '#181818' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 앨범 아트 */}
          <div className="relative h-48 overflow-hidden">
            {albumArtUrl ? (
              <Image src={albumArtUrl} alt={albumTitle ?? song.title} fill className="object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}
              >
                <Music className="w-14 h-14 text-white/30" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              aria-label="닫기"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* 곡 정보 */}
            <div>
              <h2 className="text-lg font-bold text-white">{song.title}</h2>
              <p className="text-sm text-muted mt-0.5">
                {song.artist}
                {albumTitle && (
                  <>
                    <span className="text-white/30 mx-1.5">·</span>
                    {albumTitle}
                    {releaseYear && <span className="text-white/30 ml-1.5">{releaseYear}</span>}
                  </>
                )}
              </p>
            </div>

            {/* 탭 */}
            <div
              className="grid grid-cols-2 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              role="tablist"
            >
              {([
                { key: 'info', label: '곡 정보' },
                { key: 'history', label: '공연 기록' },
              ] as const).map(({ key, label }) => {
                const active = tab === key;
                const count = key === 'history' ? stats?.performances?.length : undefined;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(key)}
                    className="py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                    style={{
                      background: active ? 'rgba(230,45,45,0.14)' : 'transparent',
                      color: active ? '#F05A5A' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {label}
                    {count !== undefined && (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: active ? 'rgba(240,90,90,0.7)' : 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {tab === 'history' && (
              <div className="max-h-[38dvh] overflow-y-auto -mx-1 px-1">
                {stats === null ? (
                  <div className="space-y-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', height: 56 }} />
                    ))}
                  </div>
                ) : !stats.performances?.length ? (
                  <p className="text-xs text-white/35 text-center py-8">아직 이 곡을 부른 공연 기록이 없어요.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {stats.performances.map((p) => {
                      const encore = getEncoreLabel(p.notes);
                      const slot = encore ?? (p.order !== null ? `${p.order}번째` : null);
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/performance/${p.id}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[11px]"
                                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(240,90,90,0.75)' }}
                              >
                                {formatShortDate(p.date)}
                              </p>
                              <p className="text-xs font-semibold text-white/85 truncate mt-0.5">{p.title}</p>
                              {(p.venue || p.city) && (
                                <p className="text-[11px] text-white/35 truncate mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  {[p.venue, p.city].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                            {slot && (
                              <span
                                className="flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{
                                  fontFamily: 'JetBrains Mono, monospace',
                                  background: encore ? 'rgba(255,190,50,0.1)' : 'rgba(255,255,255,0.05)',
                                  color: encore ? 'rgba(255,190,50,0.85)' : 'rgba(255,255,255,0.4)',
                                }}
                              >
                                {slot}
                              </span>
                            )}
                            <span className="text-white/20 text-sm flex-shrink-0">›</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {tab === 'info' && (<>
            {/* 연주 통계 */}
            <div>
              {stats === null ? (
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', height: 72 }} />
                  ))}
                </div>
              ) : (
                <>
                  {/* 연도별 카드 */}
                  <div className="grid grid-cols-2 gap-2">
                    {stats.years.map(({ year, count }) => (
                      <div
                        key={year}
                        className="rounded-lg px-2 py-2 flex flex-col items-center justify-center gap-0"
                        style={{
                          background: count > 0 ? 'rgba(230,45,45,0.08)' : 'rgba(255,255,255,0.03)',
                          border: count > 0 ? '1px solid rgba(230,45,45,0.18)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.55rem',
                            letterSpacing: '0.1em',
                            color: count > 0 ? 'rgba(240,90,90,0.7)' : 'rgba(255,255,255,0.2)',
                          }}
                        >
                          {year}
                        </span>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: count > 0 ? '#F05A5A' : 'rgba(255,255,255,0.12)',
                          }}
                        >
                          {count}
                        </span>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.55rem',
                            color: count > 0 ? 'rgba(240,90,90,0.5)' : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          회
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 마지막 공연 — 최근 연도 우선, 없으면 전체 기간 fallback */}
                  {(() => {
                    const recentYear = [...stats.years].reverse().find((y) => y.lastPerf);
                    const lastPerf = recentYear?.lastPerf ?? stats.lastPerfOverall;
                    if (!lastPerf) return null;
                    return (
                      <div
                        className="mt-2 rounded-xl px-3 py-2.5"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <p
                          className="uppercase tracking-widest mb-1 flex items-center gap-1.5"
                          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)' }}
                        >
                          마지막 공연
                          <span style={{ color: 'rgba(240,90,90,0.6)' }}>({daysSince(lastPerf.date)}일 전)</span>
                        </p>
                        <p className="text-xs font-semibold text-white/80 leading-snug">{lastPerf.title}</p>
                        <p className="text-xs text-white/35 mt-0.5">{formatDate(lastPerf.date)}</p>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* 스트리밍 링크 */}
            <div>
              <p
                className="text-xs font-semibold text-muted uppercase tracking-widest mb-3"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Streaming
              </p>
              <div className="grid grid-cols-3 gap-2">
                {streamingLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                      link.url ? 'active:scale-[0.97]' : 'cursor-not-allowed opacity-30'
                    }`}
                    style={
                      link.url
                        ? {
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${link.color}28`,
                            color: link.color,
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.2)',
                          }
                    }
                    onClick={(e) => !link.url && e.preventDefault()}
                  >
                    <span className="leading-none flex items-center justify-center">{link.icon}</span>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            </>)}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-full text-sm font-semibold text-muted hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
