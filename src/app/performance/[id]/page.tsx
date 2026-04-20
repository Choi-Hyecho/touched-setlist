import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import SetlistInteractive from '@/components/SetlistInteractive';
import type { Metadata } from 'next';
import type { Schedule, Setlist, Song } from '@/types/database.types';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: raw } = await supabaseServer
    .from('schedules')
    .select('title, performancedate, venue, posterurl')
    .eq('id', id)
    .single();

  const data = raw as { title: string; performancedate: string; venue: string; posterurl: string | null } | null;
  if (!data) return {};

  const date = format(new Date(data.performancedate), 'yyyy.MM.dd');
  const description = `${date} · ${data.venue}`;
  const images = data.posterurl ? [{ url: data.posterurl, width: 800, height: 1200 }] : [];

  return {
    title: `${data.title} — Setlist.Touched`,
    description,
    openGraph: {
      title: data.title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title: data.title,
      description,
      images: images.map(i => i.url),
    },
  };
}

type PerformanceData = Schedule & {
  schedule_types?: { id: number; type_name: string; icon: string | null } | null;
  setlists?: Array<Setlist & { songs?: Song & { albums?: { id: string; title: string; albumarturl: string | null } | null } | null }>;
};

export default async function PerformancePage({ params }: PageProps) {
  const { id } = await params;

  const { data: raw, error } = await supabaseServer
    .from('schedules')
    .select(`
      *,
      schedule_types(id, type_name, icon),
      setlists(
        id,
        order,
        notes,
        songs(
          id, title, artist,
          album_id, youtubeurl, spotifyurl, applemusicurl, melonurl, genieurl, bugsurl,
          albums(id, title, albumtype, albumarturl, releasedate)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !raw) notFound();

  const data = raw as unknown as PerformanceData;

  const setlists = [...(data.setlists ?? [])].sort((a: any, b: any) => a.order - b.order);
  const date = new Date(data.performancedate);

  return (
    <div className="page-container max-w-3xl animate-fade-in">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-muted hover:text-white text-sm mb-6 transition-colors duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
        달력으로
      </Link>

      {/* 공연 헤더 */}
      <div className="flex flex-col sm:flex-row gap-5 mb-8">
        {data.posterurl && (
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="relative w-36 h-48 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border border-white/[0.08]">
              <Image src={data.posterurl} alt={data.title} fill className="object-cover" priority />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {data.schedule_types && (
            <span className="badge mb-3 inline-block">
              {data.schedule_types.icon} {data.schedule_types.type_name}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-1">
            {data.title}
          </h1>
          {data.titleeng && data.titleeng !== data.title && (
            <p className="text-sm text-muted mb-3">{data.titleeng}</p>
          )}

          <div className="space-y-2 text-sm mt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-touched-primary flex-shrink-0" />
              <span className="text-white/80 font-medium">
                {format(date, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-touched-primary flex-shrink-0" />
              <span>
                <span className="text-white/80 font-medium">{data.venue}</span>
                {data.city && <span className="text-muted ml-1.5">· {data.city}</span>}
              </span>
            </div>
          </div>

          {data.remarks && (
            <div
              className="mt-2 p-3 rounded-xl text-sm text-white/60 border border-touched-primary/20"
              style={{ background: 'rgba(230,45,45,0.08)' }}
            >
              <span className="font-semibold text-touched-light">비고: </span>{data.remarks}
            </div>
          )}
        </div>
      </div>

      {/* 세트리스트 (인터랙티브) */}
      <SetlistInteractive
        setlists={setlists as any}
        performanceTitle={data.title}
        performanceDate={data.performancedate}
        posterurl={data.posterurl ?? null}
        description={data.description ?? null}
      />
    </div>
  );
}
