function getTouchedScheduleUrl() {
  const d = new Date();
  return `https://touched.bstage.in/schedule/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const scheduleUrl = getTouchedScheduleUrl();

  return (
    <footer className="mt-20 border-t border-white/[0.06]" style={{ background: '#0f0f0f' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-center">

        {/* 브랜드 */}
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] text-white"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Setlist<span className="text-touched-primary">.</span>Touched
        </p>

        {/* 팬메이드 고지 */}
        <p
          className="text-[0.65rem] leading-relaxed text-muted/75 mx-auto max-w-sm"
          style={{ wordBreak: 'keep-all' }}
        >
          이 사이트는 팬이 제작한 비공식 아카이브입니다. 터치드(Touched) 및 소속사와 무관하며,
          공식 정보는 반드시 아티스트의 공식 채널을 확인해주세요.
        </p>

        {/* 문의 · 버그 제보 */}
        <p
          className="text-[0.65rem] text-muted/80 mx-auto max-w-sm"
          style={{ wordBreak: 'keep-all' }}
        >
          문의 · 버그 제보: @닿음의 기록{' '}
      
          <a
            href="https://x.com/RecOfTouching"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-touched-light/90 underline decoration-white/20 underline-offset-2 transition hover:text-touched-light hover:decoration-touched-light/50"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            X
          </a>
          {' · '}
          <a
            href="https://www.instagram.com/rec_of_touched/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-touched-light/90 underline decoration-white/20 underline-offset-2 transition hover:text-touched-light hover:decoration-touched-light/50"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Instagram
          </a>
          {' · '}
          <a
            href="mailto:recoftouching@gmail.com"
            className="font-medium text-touched-light/90 underline decoration-white/20 underline-offset-2 transition hover:text-touched-light hover:decoration-touched-light/50"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Email
          </a>
        </p>

        {/* 아티스트 공식 채널 */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[0.6rem] text-muted/50" style={{ wordBreak: 'keep-all' }}>
            터치드에 대해 더 알고 싶다면
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {/* Bstage 스케줄 */}
            <a
              href={scheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[0.62rem] text-muted/60 transition hover:text-touched-light/90"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 shrink-0">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              Bstage
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/channel/UC1VarYVKLPA6DL8rLclYxBg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[0.62rem] text-muted/60 transition hover:text-touched-light/90"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 shrink-0">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              / @touched_official
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/touched_official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[0.62rem] text-muted/60 transition hover:text-touched-light/90"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 shrink-0">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              / touched_official
            </a>
            {/* X */}
            <a
              href="https://x.com/touched_official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[0.62rem] text-muted/60 transition hover:text-touched-light/90"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 shrink-0">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              / band_touched
            </a>
          </div>
        </div>

        {/* 카피라이트 */}
        <p
          className="text-[0.6rem] tracking-wide text-muted/55"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          © {year} Setlist.Touched · fan-made, not affiliated
        </p>

      </div>
    </footer>
  );
}
