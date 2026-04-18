'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar, Music, Plus, X, ChevronDown,
  CheckCircle, AlertCircle, Loader,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
interface SongOption { id: string; title: string; album_title?: string | null }
interface EntryState  { rowId: number; song_id: string; encore: boolean; notes: string | null }
interface ScheduleInfo { id: string; title: string; venue: string; city: string | null }

// ── SongCombobox ──────────────────────────────────────────────
function SongCombobox({
  songs, value, onChange,
}: { songs: SongOption[]; value: string; onChange: (id: string) => void }) {
  const [search, setSearch]   = useState('');
  const [open, setOpen]       = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => songs.find(s => s.id === value), [songs, value]);
  const filtered = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(s => s.title.toLowerCase().includes(q));
  }, [songs, search]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm text-left border transition-colors"
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderColor: open ? 'rgba(230,45,45,0.4)' : 'rgba(255,255,255,0.08)',
        }}
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-white/30'}`}>
          {selected?.title ?? '곡 선택...'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted flex-shrink-0" />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-white/[0.08] overflow-hidden"
          style={{ background: '#202020', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          <div className="p-2 border-b border-white/[0.06]">
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="검색..."
              className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none px-1"
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-muted text-xs py-4">없음</p>
            ) : (
              filtered.map(song => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => { onChange(song.id); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    song.id === value ? 'bg-touched-primary/15' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <span className={song.id === value ? 'text-touched-primary' : 'text-white/80'}>{song.title}</span>
                  {song.album_title && <span className="text-white/30 text-xs ml-2">{song.album_title}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── EntryRow ──────────────────────────────────────────────────
function EntryRow({
  entry, order, songs, onChange, onRemove, canRemove, encoreIndex,
}: {
  entry: EntryState;
  order: number;
  songs: SongOption[];
  onChange: (patch: Partial<EntryState>) => void;
  onRemove: () => void;
  canRemove: boolean;
  encoreIndex: number;
}) {
  const handleEncoreToggle = () => {
    const on = !entry.encore;
    onChange({ encore: on, notes: on ? `앵콜${encoreIndex}` : null });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-xs font-mono text-touched-primary text-right flex-shrink-0">{order}</span>

      <SongCombobox songs={songs} value={entry.song_id} onChange={id => onChange({ song_id: id })} />

      <button
        type="button"
        onClick={handleEncoreToggle}
        className="flex-shrink-0 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all"
        style={
          entry.encore
            ? { background: 'rgba(230,45,45,0.15)', borderColor: 'rgba(230,45,45,0.35)', color: '#F05A5A' }
            : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }
        }
      >
        앵콜
      </button>

      {entry.encore && (
        <input
          value={entry.notes ?? ''}
          onChange={e => onChange({ notes: e.target.value || null })}
          className="w-14 px-2 py-1.5 rounded-lg text-xs text-white outline-none border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          placeholder="앵콜1"
        />
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-0 disabled:pointer-events-none text-white/20 hover:text-red-400 hover:bg-red-400/10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── NewSongSection ────────────────────────────────────────────
const CATEGORIES = ['미발매곡', '커버곡', '기타'] as const;
type Category = typeof CATEGORIES[number];

function NewSongSection({ onAdded }: { onAdded: (song: SongOption) => void }) {
  const [title, setTitle]       = useState('');
  const [artist, setArtist]     = useState('TOUCHED');
  const [category, setCategory] = useState<Category>('미발매곡');
  const [state, setState]       = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg]           = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    setState('loading');
    try {
      const res  = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), artist: artist.trim() || 'TOUCHED', category }),
      });
      const json = await res.json();
      if (!res.ok) { setState('error'); setMsg(json.error ?? '오류'); return; }
      setState('success');
      setMsg(`"${json.title}" 추가 완료`);
      onAdded({ id: json.id, title: json.title, album_title: (json as any).albums?.title ?? null });
      setTitle('');
      setArtist('TOUCHED');
      setTimeout(() => { setState('idle'); setMsg(''); }, 2500);
    } catch {
      setState('error');
      setMsg('네트워크 오류');
    }
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Plus className="w-4 h-4 text-touched-primary" />
        <h2 className="font-bold text-white text-sm uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          New Song
        </h2>
      </div>
      <p className="text-muted text-xs">DB에 없는 새 곡을 추가합니다.</p>

      <input
        value={title}
        onChange={e => { setTitle(e.target.value); if (state !== 'idle') { setState('idle'); setMsg(''); } }}
        placeholder="곡 제목"
        className="input-field text-sm"
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
      />
      <input
        value={artist}
        onChange={e => setArtist(e.target.value)}
        placeholder="아티스트 (기본값: TOUCHED)"
        className="input-field text-sm"
      />

      <div className="flex gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className="flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={
              category === cat
                ? { background: 'rgba(230,45,45,0.15)', borderColor: 'rgba(230,45,45,0.35)', color: '#F05A5A' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {msg && (
        <p className={`text-xs ${state === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>
      )}

      <button
        onClick={handleAdd}
        disabled={!title.trim() || state === 'loading'}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {state === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
        곡 DB에 추가
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [date, setDate]               = useState('');
  const [schedule, setSchedule]       = useState<ScheduleInfo | null>(null);
  const [scheduleOptions, setScheduleOptions] = useState<(ScheduleInfo & { setlists: any[] })[]>([]);
  const [scheduleState, setScheduleState] = useState<'idle' | 'loading' | 'notfound' | 'multiple'>('idle');

  const [songs, setSongs]           = useState<SongOption[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);

  const nextRowId = useRef(3);
  const [entries, setEntries] = useState<EntryState[]>([
    { rowId: 1, song_id: '', encore: false, notes: null },
    { rowId: 2, song_id: '', encore: false, notes: null },
  ]);

  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultMsg, setResultMsg]     = useState('');

  useEffect(() => {
    setSongsLoading(true);
    fetch('/api/admin/songs')
      .then(r => r.json())
      .then((data: any[]) =>
        setSongs(data.map(s => ({ id: s.id, title: s.title, album_title: s.albums?.title ?? null })))
      )
      .catch(() => {})
      .finally(() => setSongsLoading(false));
  }, []);

  const loadSchedule = (data: any) => {
    setSchedule({ id: data.id, title: data.title, venue: data.venue, city: data.city });
    setScheduleState('idle');
    const existing: any[] = data.setlists ?? [];
    if (existing.length > 0) {
      const sorted = [...existing].sort((a: any, b: any) => a.order - b.order);
      let id = 1;
      setEntries(sorted.map((s: any) => ({
        rowId: id++,
        song_id: s.song_id,
        encore: !!s.notes,
        notes: s.notes ?? null,
      })));
      nextRowId.current = id;
    } else {
      setEntries([
        { rowId: 1, song_id: '', encore: false, notes: null },
        { rowId: 2, song_id: '', encore: false, notes: null },
      ]);
      nextRowId.current = 3;
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setDate(d);
    setSubmitState('idle');
    setResultMsg('');
    setSchedule(null);
    setScheduleOptions([]);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setScheduleState('idle');
      return;
    }

    setScheduleState('loading');
    try {
      const res = await fetch(`/api/admin/schedule?date=${d}`);
      if (!res.ok) { setScheduleState('notfound'); return; }

      const data = await res.json();
      if (data.length === 1) {
        loadSchedule(data[0]);
      } else {
        setScheduleOptions(data);
        setScheduleState('multiple');
      }
    } catch { setScheduleState('notfound'); }
  };

  // Encore auto-index per row
  const encoreIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let count = 0;
    for (const e of entries) { if (e.encore) { count++; map.set(e.rowId, count); } }
    return map;
  }, [entries]);

  const updateEntry = (rowId: number, patch: Partial<EntryState>) =>
    setEntries(prev => prev.map(e => e.rowId === rowId ? { ...e, ...patch } : e));

  const removeEntry = (rowId: number) =>
    setEntries(prev => prev.filter(e => e.rowId !== rowId));

  const addEntry = () =>
    setEntries(prev => [...prev, { rowId: nextRowId.current++, song_id: '', encore: false, notes: null }]);

  const handleSongAdded = (song: SongOption) =>
    setSongs(prev => [...prev, song].sort((a, b) => a.title.localeCompare(b.title, 'ko')));

  const handleSubmit = async () => {
    const valid = entries.filter(e => e.song_id);
    if (!schedule || valid.length === 0) return;
    setSubmitState('loading');
    try {
      const res  = await fetch('/api/admin/setlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: schedule.id,
          entries: valid.map((e, i) => ({ song_id: e.song_id, order: i + 1, notes: e.notes })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setSubmitState('error'); setResultMsg(json.error ?? '오류'); return; }
      setSubmitState('success');
      setResultMsg(`${json.schedule.title} — ${json.inserted}곡 등록 완료`);
      setEntries([
        { rowId: 1, song_id: '', encore: false, notes: null },
        { rowId: 2, song_id: '', encore: false, notes: null },
      ]);
      nextRowId.current = 3;
    } catch { setSubmitState('error'); setResultMsg('네트워크 오류'); }
  };

  const validCount = entries.filter(e => e.song_id).length;
  const canSubmit  = !!schedule && validCount > 0 && submitState !== 'loading';

  // ── 어드민 메인 ──
  return (
    <div className="page-container max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Admin<span className="text-touched-primary">.</span>
        </h1>
      </div>

      {/* 날짜 */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-touched-primary" />
          <h2 className="font-bold text-white text-sm uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            공연 날짜
          </h2>
        </div>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="input-field"
          style={{ colorScheme: 'dark' }}
        />
        {scheduleState === 'loading' && (
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Loader className="w-3 h-3 animate-spin" /> 공연 조회 중...
          </p>
        )}
        {scheduleState === 'notfound' && (
          <p className="text-xs text-red-400">해당 날짜의 공연을 찾을 수 없습니다.</p>
        )}
        {scheduleState === 'multiple' && (
          <div className="space-y-2">
            <p className="text-xs text-white/40">해당 날짜에 공연이 {scheduleOptions.length}개 있습니다. 선택하세요.</p>
            {scheduleOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => loadSchedule(opt)}
                className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm border transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(230,45,45,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{opt.title}</p>
                  <p className="text-muted text-xs">{opt.venue}{opt.city ? ` · ${opt.city}` : ''}</p>
                </div>
                <span className="text-white/20 text-sm flex-shrink-0">›</span>
              </button>
            ))}
          </div>
        )}
        {schedule && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
            style={{ background: 'rgba(230,45,45,0.08)', border: '1px solid rgba(230,45,45,0.2)' }}
          >
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">{schedule.title}</p>
              <p className="text-muted text-xs">{schedule.venue}{schedule.city ? ` · ${schedule.city}` : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* 세트리스트 */}
      <div className="card space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Music className="w-4 h-4 text-touched-primary" />
          <h2 className="font-bold text-white text-sm uppercase tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Setlist
          </h2>
          {songsLoading && <Loader className="w-3.5 h-3.5 text-muted animate-spin ml-auto" />}
        </div>

        {entries.map((entry, idx) => (
          <EntryRow
            key={entry.rowId}
            entry={entry}
            order={idx + 1}
            songs={songs}
            onChange={patch => updateEntry(entry.rowId, patch)}
            onRemove={() => removeEntry(entry.rowId)}
            canRemove={entries.length > 1}
            encoreIndex={encoreIndexMap.get(entry.rowId) ?? 1}
          />
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-white/30 hover:text-white/60 border border-dashed border-white/10 hover:border-white/20 transition-all mt-1"
        >
          <Plus className="w-4 h-4" />
          곡 추가
        </button>
      </div>

      {/* 등록 */}
      <div className="space-y-2">
        {resultMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${
              submitState === 'success'
                ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                : 'text-red-400 bg-red-400/10 border border-red-400/20'
            }`}
          >
            {submitState === 'success'
              ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />
            }
            {resultMsg}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitState === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
          {validCount > 0 ? `${validCount}곡 등록하기` : '등록하기'}
        </button>
      </div>

      {/* 새로운 곡 */}
      <NewSongSection onAdded={handleSongAdded} />
    </div>
  );
}
