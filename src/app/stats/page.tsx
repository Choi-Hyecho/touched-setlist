import { supabaseServer } from '@/lib/supabase';
import StatsInteractive from '@/components/StatsInteractive';

interface StatSong {
  song_id: string;
  title: string;
  albumTitle: string | null;
  count: number;
  lastPerf: { id: string; title: string; date: string };
  song: any;
}

export const revalidate = 3600;

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = parseInt(yearParam ?? '2026', 10);

  const today = new Date();
  const currentYear = today.getFullYear();
  const endDate =
    year === currentYear
      ? today.toISOString().slice(0, 10)
      : `${year}-12-31`;

  const [{ data: schedules }, { data: allTouchedSongs }] = await Promise.all([
    supabaseServer
      .from('schedules')
      .select(`
        id, title, performancedate,
        setlists(
          id, order, notes, song_id,
          songs(id, title, artist, album_id, youtubeurl, spotifyurl, applemusicurl, melonurl, genieurl, bugsurl,
            albums(id, title, albumarturl))
        )
      `)
      .gte('performancedate', `${year}-01-01`)
      .lte('performancedate', endDate)
      .neq('schedule_type_id', 5)
      .order('performancedate', { ascending: true }),
    supabaseServer
      .from('songs')
      .select('id, title, artist, album_id, youtubeurl, spotifyurl, applemusicurl, melonurl, genieurl, bugsurl, albums(id, title, albumtype, albumarturl, releasedate)')
      .eq('artist', 'TOUCHED'),
  ]) as any;

  // ── compute stats ────────────────────────────────────────────────────────────

  const allSchedules: any[] = schedules ?? [];

  // total shows
  const totalShows = allSchedules.length;

  // flatten all setlist entries with schedule context
  interface Entry {
    setlist: any;
    schedule: any;
  }
  const entries: Entry[] = [];
  for (const sch of allSchedules) {
    for (const sl of (sch.setlists ?? []) as any[]) {
      entries.push({ setlist: sl, schedule: sch });
    }
  }

  // total song performances
  const totalPlayed = entries.length;

  // play-count map keyed by song_id
  const countMap = new Map<string, { count: number; song: any; lastSch: any }>();
  for (const { setlist, schedule } of entries) {
    const songId: string = setlist.song_id;
    const song = setlist.songs;
    const existing = countMap.get(songId);
    if (!existing) {
      countMap.set(songId, { count: 1, song, lastSch: schedule });
    } else {
      existing.count += 1;
      // keep the latest schedule (already ascending order, so last wins)
      existing.lastSch = schedule;
    }
  }

  // unique songs
  const uniqueSongs = countMap.size;

  // TOP10
  const top10: StatSong[] = Array.from(countMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([song_id, { count, song, lastSch }]) => ({
      song_id,
      title: song?.title ?? '알 수 없는 곡',
      albumTitle: (song?.albums as any)?.title ?? null,
      count,
      lastPerf: {
        id: lastSch?.id ?? '',
        title: lastSch?.title ?? '',
        date: lastSch?.performancedate ?? '',
      },
      song: song ?? null,
    }));

  // Opener TOP10 (order === 1)
  const openerMap = new Map<string, { count: number; title: string }>();
  for (const { setlist } of entries) {
    if (setlist.order === 1) {
      const songId: string = setlist.song_id;
      const title: string = setlist.songs?.title ?? '알 수 없는 곡';
      const existing = openerMap.get(songId);
      if (!existing) openerMap.set(songId, { count: 1, title });
      else existing.count += 1;
    }
  }
  const openerTop10 = Array.from(openerMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([song_id, { count, title }]) => ({ song_id, title, count }));

  // Closer TOP10 (highest order per schedule)
  const closerMap = new Map<string, { count: number; title: string }>();
  for (const sch of allSchedules) {
    const setlists = (sch.setlists ?? []) as any[];
    if (setlists.length === 0) continue;
    const last = setlists.reduce((prev: any, curr: any) =>
      curr.order > prev.order ? curr : prev
    );
    const songId: string = last.song_id;
    const title: string = last.songs?.title ?? '알 수 없는 곡';
    const existing = closerMap.get(songId);
    if (!existing) closerMap.set(songId, { count: 1, title });
    else existing.count += 1;
  }
  const closerTop10 = Array.from(closerMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([song_id, { count, title }]) => ({ song_id, title, count }));

  // Encore TOP10 (notes matches /앵콜|encore/i)
  const encoreMap = new Map<string, { count: number; title: string }>();
  for (const { setlist } of entries) {
    if (/앵콜|encore/i.test(setlist.notes ?? '')) {
      const songId: string = setlist.song_id;
      const title: string = setlist.songs?.title ?? '알 수 없는 곡';
      const existing = encoreMap.get(songId);
      if (!existing) encoreMap.set(songId, { count: 1, title });
      else existing.count += 1;
    }
  }
  const encoreTop10 = Array.from(encoreMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([song_id, { count, title }]) => ({ song_id, title, count }));

  // Least played — TOUCHED 곡 중 albumtype이 'TV'가 아닌 곡, 미발매곡 제외, 버전 곡 제외, 0회 포함
  const leastPlayed: StatSong[] = ((allTouchedSongs ?? []) as any[])
    .filter((s: any) => {
      const albumtype  = s.albums?.albumtype ?? '';
      const albumTitle = s.albums?.title ?? '';
      const isVersion  = /\(.*ver\.?\)/i.test(s.title);
      return albumtype !== 'TV' && albumtype !== 'Cover' && !isVersion;
    })
    .map((s: any) => {
      const entry = countMap.get(s.id);
      return {
        song_id: s.id,
        title: s.title,
        albumTitle: s.albums?.title ?? null,
        count: entry?.count ?? 0,
        lastPerf: {
          id: entry?.lastSch?.id ?? '',
          title: entry?.lastSch?.title ?? '',
          date: entry?.lastSch?.performancedate ?? '',
        },
        song: s,
      };
    })
    .sort((a: StatSong, b: StatSong) => a.count - b.count)
    .slice(0, 20);

  return (
    <div className="page-container">
      <StatsInteractive
        year={year}
        top10={top10}
        leastPlayed={leastPlayed}
        openerTop10={openerTop10}
        closerTop10={closerTop10}
        encoreTop10={encoreTop10}
        totalShows={totalShows}
        uniqueSongs={uniqueSongs}
        totalPlayed={totalPlayed}
      />
    </div>
  );
}
