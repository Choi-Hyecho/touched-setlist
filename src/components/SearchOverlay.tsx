'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SearchResult {
  id: string;
  title: string;
  titleeng: string | null;
  performancedate: string;
  posterurl: string | null;
}

interface Props {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  // 바깥 클릭 / Escape 닫기
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onMouse);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // 디바운스 검색
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = useCallback((id: string) => {
    onClose();
    router.push(`/performance/${id}`);
  }, [onClose, router]);

  return (
    <>
      {/* 반투명 딤 배경 */}
      <div className="fixed inset-0 z-[45]" style={{ background: 'rgba(0,0,0,0.4)' }} />

      {/* 검색 패널 — 헤더(h-14) 바로 아래 */}
      <div className="fixed top-14 inset-x-0 z-[46] px-4 pt-2">
        <div
          ref={panelRef}
          className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden border border-white/[0.08]"
          style={{ background: '#202020', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          {/* 입력창 */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="공연명 검색..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-white/30 hover:text-white/60 transition-colors px-1"
              >
                지우기
              </button>
            )}
          </div>

          {/* 결과 목록 */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-center text-white/30 text-xs py-5">검색 중...</p>
            ) : query.trim() && results.length === 0 ? (
              <p className="text-center text-white/30 text-xs py-5">결과 없음</p>
            ) : results.length > 0 ? (
              results.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r.id)}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.06] border-b border-white/[0.04] last:border-0"
                >
                  {r.posterurl ? (
                    <img
                      src={r.posterurl}
                      alt=""
                      className="w-8 h-10 rounded-md object-cover flex-shrink-0"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-10 rounded-md flex-shrink-0"
                      style={{ background: 'rgba(230,45,45,0.12)', border: '1px solid rgba(230,45,45,0.15)' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">{r.title}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {format(new Date(r.performancedate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                    </p>
                  </div>
                  <span className="text-white/20 text-xs flex-shrink-0 flex-shrink-0">→</span>
                </button>
              ))
            ) : (
              <p className="text-center text-white/20 text-xs py-5">공연명 또는 유사어로 검색</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
