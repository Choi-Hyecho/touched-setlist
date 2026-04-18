'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, BarChart3, Music, ExternalLink } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';

const EMOJIS = ['🐱', '🐻‍❄️', '🐸', '🐰'];

interface EmojiDrop {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const navLinks = [
  { href: '/',      label: 'Calendar', icon: Calendar  },
  { href: '/stats', label: 'Stats',    icon: BarChart3 },
];


function getTouchedScheduleUrl() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `https://touched.bstage.in/schedule/${year}/${month}`;
}

export default function Header() {
  const pathname = usePathname();
  const [scheduleUrl, setScheduleUrl] = useState('');
  useEffect(() => { setScheduleUrl(getTouchedScheduleUrl()); }, []);
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [drops, setDrops] = useState<EmojiDrop[]>([]);

  const triggerRain = useCallback(() => {
    const newDrops: EmojiDrop[] = Array.from({ length: 35 }, (_, i) => ({
      id: Date.now() + i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: Math.random() * 98,
      delay: Math.random() * 2.5,
      duration: 2.5 + Math.random() * 2,
      size: 1.5 + Math.random() * 1.2,
    }));
    setDrops(newDrops);
    setTimeout(() => setDrops([]), 6000);
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    clickCountRef.current += 1;
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);
    if (clickCountRef.current >= 5) {
      e.preventDefault();
      clickCountRef.current = 0;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      triggerRain();
    }
  }, [triggerRain]);

  return (
    <>
    <header
      className="site-header sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: 'rgba(15,15,15,0.92)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={handleLogoClick}>
            <div
              className="w-7 h-7 rounded-lg bg-touched-primary flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 0 12px rgba(230,45,45,0.5)' }}
            >
              <Music className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-sm font-bold uppercase tracking-[0.25em] text-white"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Setlist<span className="text-touched-primary">.</span>Touched
            </span>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-touched-primary border border-touched-primary/30'
                      : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  style={active ? { background: 'rgba(230,45,45,0.12)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            {/* 구분선 */}
            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* 공식 스케줄 링크 */}
            <a
              href={scheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted hover:text-white border border-transparent hover:border-white/10 transition-all duration-200 hover:bg-white/5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">공식 스케줄</span>
            </a>

          </nav>
        </div>
      </div>
    </header>

      {/* 이스터에그: 이모지 비 */}
      {drops.length > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
          {drops.map(({ id, emoji, left, delay, duration, size }) => (
            <span
              key={id}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '-60px',
                fontSize: `${size}rem`,
                animation: `emojifall ${duration}s ${delay}s ease-in forwards`,
                lineHeight: 1,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
