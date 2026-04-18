import Calendar from '@/components/Calendar';
import { supabaseServer } from '@/lib/supabase';

export const revalidate = 3600; // ISG: 1시간마다 재생성

export default async function Home() {
  // 공연 데이터와 타입 병렬로 가져오기
  const [{ data: schedulesRaw, error: schedulesError }, { data: scheduleTypesRaw, error: typesError }] =
    await Promise.all([
      supabaseServer
        .from('schedules')
        .select('*, setlists(id)')
        .gte('performancedate', '2025-01-01')
        .order('performancedate', { ascending: false }),
      supabaseServer
        .from('schedule_types')
        .select('*')
        .order('id', { ascending: true }),
    ]);

  if (schedulesError) {
    console.error('[SCHEDULES] code:', schedulesError.code, 'message:', schedulesError.message);
  }
  if (typesError) {
    console.error('[SCHEDULE_TYPES] code:', typesError.code, 'message:', typesError.message);
  }

  const scheduleTypes = scheduleTypesRaw ?? [];

  // 타입 맵 만들어서 직접 붙이기 (relationship embedding 없이)
  const typeMap = new Map(scheduleTypes.map((t: any) => [t.id, t]));
  const schedules = (schedulesRaw ?? []).map((s: any) => ({
    ...s,
    SCHEDULE_TYPES: typeMap.get(s.schedule_type_id) ?? null,
  }));

  return (
    <div className="page-container">
      <Calendar schedules={schedules} scheduleTypes={scheduleTypes} />
      <p className="text-muted/50 text-xs text-center mt-6">
        2025년부터 확인 가능합니다.
      </p>
    </div>
  );
}
