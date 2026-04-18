'use client';

import { useState, useRef } from 'react';
import SongModal from '@/components/SongModal';

// ── Types ────────────────────────────────────────────────────────────────────

interface StatSong {
  song_id: string;
  title: string;
  albumTitle: string | null;
  count: number;
  lastPerf: { id: string; title: string; date: string };
  song: any;
}

interface StatsInteractiveProps {
  year: number;
  top10: StatSong[];
  leastPlayed: StatSong[];
  openerTop10: Array<{ song_id: string; title: string; count: number }>;
  closerTop10: Array<{ song_id: string; title: string; count: number }>;
  encoreTop10: Array<{ song_id: string; title: string; count: number }>;
  totalShows: number;
  uniqueSongs: number;
  totalPlayed: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const YEARS = [2025, 2026];
const MEDALS = ['🥇', '🥈', '🥉'];

// ── CSS Bar ───────────────────────────────────────────────────────────────────

function CssBar({ pct, thin = false }: { pct: number; thin?: boolean }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height: thin ? 6 : 8, background: 'rgba(255,255,255,0.06)' }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(pct, pct > 0 ? 4 : 0)}%`,
          background: '#E62D2D',
          opacity: 0.85,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StatsInteractive({
  year,
  top10,
  leastPlayed,
  openerTop10,
  closerTop10,
  encoreTop10,
  totalShows,
  uniqueSongs,
  totalPlayed,
}: StatsInteractiveProps) {
  const [selectedSong, setSelectedSong] = useState<StatSong | null>(null);
  const [showAllTop, setShowAllTop] = useState(false);
  const [showAllLeast, setShowAllLeast] = useState(false);
  const [showAllOpener, setShowAllOpener] = useState(false);
  const [showAllCloser, setShowAllCloser] = useState(false);
  const [showAllEncore, setShowAllEncore] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const leastRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLDivElement>(null);
  const closerRef = useRef<HTMLDivElement>(null);
  const encoreRef = useRef<HTMLDivElement>(null);

  const maxTop10 = top10[0]?.count ?? 1;
return (
    <>
      {/* ── Header ── */}
      <div className="mb-8">
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          STATS<span className="text-touched-primary">.</span>{year}
        </h1>

        {/* Year tabs */}
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <a
              key={y}
              href={`/stats?year=${y}`}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                y === year
                  ? { background: '#E62D2D', color: '#fff' }
                  : {
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {y}년
            </a>
          ))}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div
        className="flex mb-8 rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#181818' }}
      >
        {[
          { label: '총 공연', value: totalShows, unit: '회' },
          { label: '연주된 곡', value: uniqueSongs, unit: '곡' },
          { label: '총 연주', value: totalPlayed, unit: '회' },
        ].map(({ label, value, unit }, i) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center justify-center py-5 gap-1"
            style={i > 0 ? { borderLeft: '1px solid rgba(255,255,255,0.06)' } : {}}
          >
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-3xl sm:text-4xl font-extrabold text-touched-primary"
                style={{ fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}
              >
                {value}
              </span>
              <span
                className="text-sm font-bold"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(230,45,45,0.6)' }}
              >
                {unit}
              </span>
            </div>
            <p className="text-[11px] text-white/35 tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* ── TOP10 ── */}
      <div className="card mb-6" ref={topRef}>
        <h2
          className="section-title mb-5"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          MOST PLAYED
        </h2>

        {top10.length === 0 ? (
          <p className="text-white/30 text-sm py-4 text-center">데이터 없음</p>
        ) : (
          <>
          <div className="space-y-1">
            {(showAllTop ? top10 : top10.slice(0, 5)).map((item, idx) => (
              <button
                key={item.song_id}
                onClick={() => setSelectedSong(item)}
                className="w-full text-left rounded-xl px-3 py-3 transition-all duration-150 active:scale-[0.99]"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.04)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'transparent')
                }
              >
                <div className="flex items-center gap-3">
                  {/* rank */}
                  <span
                    className="w-7 text-center text-sm font-bold flex-shrink-0"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: idx === 0 ? '#E62D2D' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {idx + 1}
                  </span>

                  {/* title + album */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </p>
                    {item.albumTitle && (
                      <p className="text-xs text-white/35 truncate">{item.albumTitle}</p>
                    )}
                    {/* bar */}
                    <div className="mt-1.5">
                      <CssBar pct={(item.count / maxTop10) * 100} />
                    </div>
                  </div>

                  {/* count badge */}
                  <span
                    className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      background: 'rgba(230,45,45,0.12)',
                      color: '#F05A5A',
                      border: '1px solid rgba(230,45,45,0.2)',
                    }}
                  >
                    {item.count}회
                  </span>
                </div>
              </button>
            ))}
          </div>
          {top10.length > 5 && (
            <button
              onClick={() => {
                const next = !showAllTop;
                setShowAllTop(next);
                if (!next) setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
              className="w-full mt-2 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {showAllTop ? `접기 ↑` : `더보기 +${top10.length - 5} ↓`}
            </button>
          )}
          </>
        )}
      </div>

      {/* ── Least played ── */}
      {leastPlayed.length > 0 && (
        <div className="card mb-6" ref={leastRef}>
          <h2
            className="section-title mb-5"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            LEAST PLAYED
          </h2>
          <div className="space-y-1">
            {(showAllLeast ? leastPlayed : leastPlayed.slice(0, 5)).map((item, idx) => (
              <button
                key={item.song_id}
                onClick={() => setSelectedSong(item)}
                className="w-full text-left rounded-xl px-3 py-3 transition-all duration-150 active:scale-[0.99]"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.04)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'transparent')
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 text-center text-sm font-bold flex-shrink-0"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: idx === 0 ? '#a7a7a7' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </p>
                    {item.albumTitle && (
                      <p className="text-xs text-white/35 truncate">{item.albumTitle}</p>
                    )}
                  </div>
                  <span
                    className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.35)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {item.count}회
                  </span>
                </div>
              </button>
            ))}
          </div>
          {leastPlayed.length > 5 && (
            <button
              onClick={() => {
                const next = !showAllLeast;
                setShowAllLeast(next);
                if (!next) setTimeout(() => leastRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
              className="w-full mt-2 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {showAllLeast ? `접기 ↑` : `더보기 +${leastPlayed.length - 5} ↓`}
            </button>
          )}
        </div>
      )}

      {/* ── Opener / Closer / Encore ── */}
      {[
        { label: 'OPENER TOP10', list: openerTop10, showAll: showAllOpener, setShowAll: setShowAllOpener, ref: openerRef },
        { label: 'CLOSER TOP10', list: closerTop10, showAll: showAllCloser, setShowAll: setShowAllCloser, ref: closerRef },
        { label: 'ENCORE TOP10', list: encoreTop10, showAll: showAllEncore, setShowAll: setShowAllEncore, ref: encoreRef },
      ].map(({ label, list, showAll, setShowAll, ref }) => (
        <div className="card mb-4" key={label} ref={ref}>
          <h2
            className="section-title mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem' }}
          >
            {label}
          </h2>
          {list.length === 0 ? (
            <p className="text-white/30 text-sm py-2 text-center">데이터 없음</p>
          ) : (
            <>
              <div className="space-y-1">
                {(showAll ? list : list.slice(0, 5)).map((item, idx) => (
                  <div key={item.song_id} className="flex items-center gap-3 px-1 py-2">
                    <span
                      className="w-7 text-center flex-shrink-0"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: idx < 3 ? '1.1rem' : '0.8rem',
                        color: idx === 0 ? '#E62D2D' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {idx < 3 ? MEDALS[idx] : idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <div className="mt-1">
                        <CssBar pct={(item.count / (list[0]?.count ?? 1)) * 100} thin />
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs font-bold"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {item.count}회
                    </span>
                  </div>
                ))}
              </div>
              {list.length > 5 && (
                <button
                  onClick={() => {
                    const next = !showAll;
                    setShowAll(next);
                    if (!next) setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                  }}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  {showAll ? `접기 ↑` : `더보기 +${list.length - 5} ↓`}
                </button>
              )}
            </>
          )}
        </div>
      ))}

{/* ── Song detail modal ── */}
      {selectedSong && (
        <SongModal
          song={selectedSong.song}
          isOpen={!!selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </>
  );
}
