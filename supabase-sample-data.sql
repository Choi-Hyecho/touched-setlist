-- ============================================
-- Touched Setlist Archive - 샘플 데이터
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- Step 1: 샘플 곡 추가 (꼭 필요)
-- ============================================

INSERT INTO SONGS (title, album, artist) VALUES
  ('그대의 손', 'Single', 'Touched'),
  ('밤새도록', 'The Beginning', 'Touched'),
  ('별이 되어', 'The Beginning', 'Touched'),
  ('시작', 'New Phase', 'Touched'),
  ('끝', 'New Phase', 'Touched'),
  ('봄날', 'Seasons', 'Touched'),
  ('여름의 꿈', 'Seasons', 'Touched'),
  ('가을 하늘', 'Seasons', 'Touched'),
  ('겨울 이야기', 'Seasons', 'Touched'),
  ('추억', 'Memories', 'Touched'),
  ('오늘', 'Today', 'Touched'),
  ('내일', 'Tomorrow', 'Touched')
ON CONFLICT (title) DO NOTHING;

-- 확인: SELECT COUNT(*) FROM SONGS;

-- ============================================
-- Step 2: 샘플 공연 추가 (꼭 필요)
-- ============================================

INSERT INTO SCHEDULES (
  title, 
  performanceDate, 
  venue, 
  city, 
  schedule_type_id, 
  description,
  remarks
) VALUES
  (
    '2024 Single Album Release Concert',
    '2024-03-15',
    'Jangchung Arena',
    'Seoul',
    1,
    '신앨범 발표 콘서트로 새로운 곡들을 처음 선보이는 특별한 무대입니다. 팬들을 위한 사인회도 준비되어 있습니다.',
    '티켓: 매진'
  ),
  (
    'Touched Spring Festival 2024',
    '2024-04-20',
    'Olympic Gymnastics Arena',
    'Seoul',
    2,
    '2024 봄 페스티벌 특별 무대. 다른 아티스트들과 함께 무대를 공유합니다.',
    '야외 페스티벌'
  ),
  (
    'Music Show Recording - MBC',
    '2024-05-10',
    'MBC Studio',
    'Seoul',
    3,
    '음악 프로그램 녹화 방송용 공연입니다. 신곡 무대 예정.',
    '방송일: 5월 17일 (금) 저녁 6시'
  ),
  (
    'Summer Open Air Concert',
    '2024-08-01',
    'Seoul Plaza',
    'Seoul',
    1,
    '한여름 야외 공연. 독특한 분위기와 특별한 무대 구성이 준비되어 있습니다.',
    '야외 공연이므로 날씨 영향 가능'
  ),
  (
    'Autumn Concert Tour - Seoul Stop',
    '2024-10-12',
    'Blue Square Amphitheatre',
    'Seoul',
    1,
    '가을 콘서트 투어 서울 공연. 투어만의 특별한 퍼포먼스와 무대 구성입니다.',
    null
  ),
  (
    'Winter Special Live Concert',
    '2024-12-25',
    'Sejong Center',
    'Seoul',
    1,
    '겨울 특별 라이브 콘서트. 크리스마스 스페셜 굿즈도 판매됩니다.',
    '크리스마스 이브 공연'
  ),
  (
    '2025 New Year Live',
    '2025-01-01',
    'Olympic Gymnastics Arena',
    'Seoul',
    1,
    '2025년 새해 첫 공연. 새로운 음악과 새해의 다짐을 함께 나누는 시간입니다.',
    null
  ),
  (
    'Online Concert - Vlive',
    '2025-02-14',
    'Virtual Studio',
    'Online',
    5,
    'V Live로 진행되는 온라인 콘서트입니다. 전 세계 팬들이 함께할 수 있습니다.',
    null
  )
ON CONFLICT (performanceDate) DO NOTHING;

-- 확인: SELECT COUNT(*) FROM SCHEDULES;

-- ============================================
-- Step 3: 샘플 세트리스트 추가
-- ============================================
-- 주의: 이 부분은 실제 ID가 필요합니다.
-- SONGS와 SCHEDULES 테이블의 ID를 먼저 조회해야 합니다.

-- 먼저 ID 확인하기:
-- SELECT id, title FROM SCHEDULES ORDER BY performanceDate;
-- SELECT id, title FROM SONGS ORDER BY title;

-- 예시 데이터 (실제 ID로 교체 필요):
-- 각 공연의 첫 번째 세트리스트만 추가하는 권장하는 방법

-- 다음 쿼리를 실행하여 첫 번째 공연의 ID 확인:
-- SELECT id FROM SCHEDULES ORDER BY performanceDate LIMIT 1;

-- 그 ID를 [SCHEDULE_ID_1]에 입력하고 다음을 실행:
/*
INSERT INTO SETLISTS (schedule_id, song_id, "order") 
SELECT 
  s.id as schedule_id,
  (SELECT id FROM SONGS WHERE title = '그대의 손') as song_id,
  1 as "order"
FROM SCHEDULES s
WHERE s.title = '2024 Single Album Release Concert'
UNION ALL
SELECT 
  s.id,
  (SELECT id FROM SONGS WHERE title = '밤새도록'),
  2
FROM SCHEDULES s
WHERE s.title = '2024 Single Album Release Concert'
UNION ALL
SELECT 
  s.id,
  (SELECT id FROM SONGS WHERE title = '별이 되어'),
  3
FROM SCHEDULES s
WHERE s.title = '2024 Single Album Release Concert'
UNION ALL
SELECT 
  s.id,
  (SELECT id FROM SONGS WHERE title = '시작'),
  4
FROM SCHEDULES s
WHERE s.title = '2024 Single Album Release Concert'
UNION ALL
SELECT 
  s.id,
  (SELECT id FROM SONGS WHERE title = '봄날'),
  5
FROM SCHEDULES s
WHERE s.title = '2024 Single Album Release Concert';

-- 확인: SELECT COUNT(*) FROM SETLISTS;
*/

-- ============================================
-- 선택사항: 스트리밍 링크 추가
-- ============================================
/*
UPDATE SONGS SET 
  spotifyUrl = 'https://open.spotify.com/track/example',
  appleMusicUrl = 'https://music.apple.com/kr/album/example',
  melonUrl = 'https://www.melon.com/song/detail.htm?songId=example',
  genieUrl = 'https://www.genie.co.kr/shop/song/detail/example'
WHERE title = '그대의 손';
*/

-- ============================================
-- 데이터 확인 쿼리
-- ============================================

-- 등록된 곡 확인
-- SELECT COUNT(*) as song_count FROM SONGS;

-- 등록된 공연 확인
-- SELECT COUNT(*) as schedule_count FROM SCHEDULES;

-- 등록된 세트리스트 확인
-- SELECT COUNT(*) as setlist_count FROM SETLISTS;

-- 공연 타입별 개수
-- SELECT st.type_name, COUNT(s.id) 
-- FROM SCHEDULES s 
-- LEFT JOIN SCHEDULE_TYPES st ON s.schedule_type_id = st.id 
-- GROUP BY st.type_name;

-- ============================================
-- 설정 완료!
-- ============================================
-- 이제 http://localhost:3000 에서 달력에 공연이 표시됩니다
-- ============================================
