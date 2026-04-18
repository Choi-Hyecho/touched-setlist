'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Schedule } from '@/types/database.types';

interface CalendarProps {
  schedules: Schedule[];
  scheduleTypes: Array<{ id: number; type_name: string; icon: string | null }>;
}

export default function Calendar({ schedules, scheduleTypes }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [multiPopup, setMultiPopup] = useState<any[] | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setToday(new Date());
    const saved = sessionStorage.getItem('calendar-month');
    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) setCurrentDate(d);
    }
  }, []);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const minYear  = 2025;
  const atMin    = currentDate.getFullYear() === minYear && currentDate.getMonth() === 0;

  // 달력용 — 타입 필터만, 검색어 무관
  const filteredSchedules = useMemo(() =>
    schedules.filter((s) => !selectedType || s.schedule_type_id === selectedType),
  [schedules, selectedType]);

  // 검색 드롭다운용 — title + titleeng + aliases
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return schedules
      .filter((s) =>
        s.title.toLowerCase().includes(q) ||
        (s.titleeng ?? '').toLowerCase().includes(q) ||
        (Array.isArray((s as any).aliases)
          ? ((s as any).aliases as string[]).join(',')
          : ((s as any).aliases ?? '')
        ).toLowerCase().includes(q)
      )
      .sort((a, b) => b.performancedate.localeCompare(a.performancedate))
      .slice(0, 8);
  }, [schedules, searchQuery]);

  const monthStart  = startOfMonth(currentDate);
  const monthEnd    = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const emptyDays   = Array(monthStart.getDay()).fill(null);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    filteredSchedules.forEach((s) => {
      const key = s.performancedate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [filteredSchedules]);

  const handlePrevMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    sessionStorage.setItem('calendar-month', next.toISOString());
    setCurrentDate(next);
  };
  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    sessionStorage.setItem('calendar-month', next.toISOString());
    setCurrentDate(next);
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <>
    {/* 페이지 이동 로딩 바 */}
    {navigating && (
      <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5" style={{ background: 'rgba(230,45,45,0.2)' }}>
        <div style={{ height: '100%', background: '#E62D2D', animation: 'loadingbar 1.2s ease-out forwards' }} />
      </div>
    )}
    <div className="space-y-3">
      {/* 검색 */}
      <div className="relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="공연명으로 검색..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          className="input-field pl-9"
        />

        {/* 드롭다운 결과 */}
        {searchOpen && searchQuery.trim().length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden border border-white/[0.08] z-50"
            style={{ background: '#202020', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
          >
            {searchResults.length === 0 ? (
              <p className="text-center text-white/30 text-xs py-4">결과 없음</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setSearchOpen(false); setSearchQuery(''); setNavigating(true); router.push(`/performance/${s.id}`); }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] border-b border-white/[0.04] last:border-0 transition-colors"
                    >
                      {s.posterurl ? (
                        <img src={s.posterurl} alt="" className="w-8 h-10 rounded-md object-cover flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                      ) : (
                        <div className="w-8 h-10 rounded-md flex-shrink-0" style={{ background: 'rgba(230,45,45,0.12)', border: '1px solid rgba(230,45,45,0.15)' }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">{s.title}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">
                          {format(new Date(s.performancedate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 필터 버튼 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedType(null)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
            selectedType === null
              ? 'text-touched-primary border-touched-primary/30'
              : 'text-muted border-white/10 hover:text-white hover:border-white/20'
          }`}
          style={selectedType === null ? { background: 'rgba(230,45,45,0.12)' } : { background: 'rgba(255,255,255,0.05)' }}
        >
          전체
        </button>
        {scheduleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedType === type.id
                ? 'text-touched-primary border-touched-primary/30'
                : 'text-muted border-white/10 hover:text-white hover:border-white/20'
            }`}
            style={selectedType === type.id ? { background: 'rgba(230,45,45,0.12)' } : { background: 'rgba(255,255,255,0.05)' }}
          >
            {type.icon && <span className="mr-1">{type.icon}</span>}
            {type.type_name}
          </button>
        ))}
      </div>

      {/* 달력 */}
      <div className="relative z-10 rounded-2xl border border-white/[0.06] p-2 sm:p-4" style={{ background: '#181818' }}>
        {/* 월 네비게이션 */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-base sm:text-lg font-bold text-white uppercase tracking-[0.15em]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {format(currentDate, 'yyyy · MMMM', { locale: ko })}
          </h2>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (!atMin) handlePrevMonth();
              }}
              disabled={atMin}
              className="p-2 rounded-lg transition disabled:opacity-20 disabled:cursor-not-allowed text-muted hover:text-white hover:bg-white/5"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNextMonth();
              }}
              className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, idx) => (
            <div
              key={day}
              className={`text-center py-1 text-[10px] sm:text-xs font-semibold tracking-wider ${
                idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-white/25'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* 빈 칸 */}
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-[2/3] rounded-md sm:rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }} />
          ))}

          {/* 날짜 */}
          {daysInMonth.map((day) => {
            const dateKey      = format(day, 'yyyy-MM-dd');
            const daySchedules = schedulesByDate.get(dateKey) || [];
            const inMonth      = isSameMonth(day, currentDate);
            const isToday      = today ? isSameDay(day, today) : false;
            const first        = daySchedules[0];
            const hasEvents    = daySchedules.length > 0;
            const hasSetlist   = daySchedules.some((s: any) => s.setlists?.length > 0);
            const dow          = day.getDay(); // 0=일, 6=토
            const dowColor     = dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-white/30';

            // 공연 셀 내용 (단일/복수 공통) — hasEvents일 때만 사용
            const cellInner = hasEvents ? (
              <>
                {first?.posterurl ? (
                  <>
                    <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={first.posterurl}
                        alt={first.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 14vw, 120px"
                      />
                      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/70 to-transparent" />
                    </div>
                    <span className={`absolute top-1 left-1.5 text-[10px] sm:text-xs font-bold leading-none z-10 ${dow === 0 ? 'text-red-300' : dow === 6 ? 'text-blue-300' : 'text-white'}`}>
                      {format(day, 'd')}
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col p-1.5">
                    <span className={`text-[10px] sm:text-xs font-bold mb-1 ${dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-white/60'}`}>
                      {format(day, 'd')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-touched-light leading-tight line-clamp-4 flex-1">
                      {first.title}
                    </span>
                  </div>
                )}
                {/* 세트리스트 인디케이터 */}
                <span
                  className="absolute bottom-1 left-1 text-[8px] leading-none z-10"
                  style={{ color: hasSetlist ? 'rgba(240,90,90,0.9)' : 'rgba(255,255,255,0.25)' }}
                >
                  {hasSetlist ? '♪' : '?'}
                </span>
                {/* 복수 공연 배지 */}
                {daySchedules.length > 1 && (
                  <div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center z-10"
                    style={{ background: 'rgba(230,45,45,0.9)' }}
                  >
                    {daySchedules.length}
                  </div>
                )}
              </>
            ) : null;

            const cellStyle = {
              border: isToday ? '2px solid #E62D2D' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: isToday ? '0 0 10px rgba(230,45,45,0.5)' : undefined,
            };

            return (
              <div key={dateKey} className="relative aspect-[2/3]">
                {hasEvents ? (
                  daySchedules.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setMultiPopup(daySchedules)}
                      onTouchEnd={(e) => { e.preventDefault(); setMultiPopup(daySchedules); }}
                      className="block w-full h-full rounded-md sm:rounded-lg overflow-hidden relative"
                      style={{ ...cellStyle, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    >
                      {/* 왼쪽 위 삼각형 — 첫 번째 공연 */}
                      <div
                        className="absolute inset-0"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                      >
                        {daySchedules[0]?.posterurl ? (
                          <Image src={daySchedules[0].posterurl} alt={daySchedules[0].title} fill className="object-cover" sizes="14vw" />
                        ) : (
                          <div className="w-full h-full" style={{ background: 'rgba(230,45,45,0.25)' }} />
                        )}
                      </div>
                      {/* 오른쪽 아래 삼각형 — 두 번째 공연 */}
                      <div
                        className="absolute inset-0"
                        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                      >
                        {daySchedules[1]?.posterurl ? (
                          <Image src={daySchedules[1].posterurl} alt={daySchedules[1].title} fill className="object-cover" sizes="14vw" />
                        ) : (
                          <div className="w-full h-full" style={{ background: 'rgba(100,100,120,0.25)' }} />
                        )}
                      </div>
                      {/* 대각선 구분선 */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(to bottom right, transparent calc(50% - 0.5px), rgba(0,0,0,0.6) calc(50% - 0.5px), rgba(0,0,0,0.6) calc(50% + 0.5px), transparent calc(50% + 0.5px))',
                        }}
                      />
                      {/* 날짜 */}
                      <span
                        className={`absolute top-1 left-1.5 text-[10px] sm:text-xs font-bold leading-none z-10 drop-shadow ${dow === 0 ? 'text-red-300' : dow === 6 ? 'text-blue-300' : 'text-white'}`}
                      >
                        {format(day, 'd')}
                      </span>
                      {/* 2 뱃지 */}
                      <div
                        className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center z-10"
                        style={{ background: 'rgba(230,45,45,0.9)' }}
                      >
                        2
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={`/performance/${first.id}`}
                      className="block w-full h-full rounded-md sm:rounded-lg overflow-hidden group"
                      style={cellStyle}
                    >
                      {cellInner}
                    </Link>
                  )
                ) : (
                  /* 공연 없는 날 */
                  <div
                    className="w-full h-full rounded-lg flex flex-col items-center justify-start p-1"
                    style={{
                      background: isToday ? 'rgba(230,45,45,0.08)' : inMonth ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: isToday ? '2px solid #E62D2D' : '1px solid transparent',
                      boxShadow: isToday ? '0 0 10px rgba(230,45,45,0.4)' : undefined,
                    }}
                  >
                    {isToday ? (
                      <span className="text-[10px] sm:text-xs font-bold leading-none text-white bg-touched-primary rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mt-0.5">
                        {format(day, 'd')}
                      </span>
                    ) : (
                      <span className={`text-[10px] sm:text-xs font-semibold leading-none mt-0.5 ${inMonth ? dowColor : 'text-white/10'}`}>
                        {format(day, 'd')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 검색 결과 없음 */}
      {filteredSchedules.length === 0 && !searchQuery && (
        <div className="text-center py-8">
          <p className="text-muted text-sm">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* 복수 공연 선택 팝업 */}
      {multiPopup && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMultiPopup(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[70] p-4 pb-8">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {format(new Date(multiPopup[0].performancedate), 'M월 d일', { locale: ko })} 공연 선택
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {multiPopup.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/performance/${s.id}`}
                    onClick={() => setMultiPopup(null)}
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors"
                  >
                    {s.posterurl && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={s.posterurl} alt={s.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {(s.setlists?.length ?? 0) > 0 ? '♪ 세트리스트 있음' : '세트리스트 없음'}
                      </p>
                    </div>
                    <span className="text-white/20 text-sm">›</span>
                  </Link>
                ))}
              </div>
              <button
                onClick={() => setMultiPopup(null)}
                className="w-full py-3.5 text-sm text-white/40 font-semibold"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                닫기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
