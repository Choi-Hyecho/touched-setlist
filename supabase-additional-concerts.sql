-- ============================================
-- 추가 공연 데이터 (나무위키 기준)
-- supabase-title-migration.sql 실행 후 적용
-- ※ title=한국어, titleEng=영어
-- ============================================

INSERT INTO SCHEDULES (title, titleEng, performanceDate, venue, city, schedule_type_id) VALUES

  -- ========== 2020 ==========
  ('2020 인디스땅스x아무공연 온라인 라이브',  '2020 Indiestance x Amu Concert Online',  '2020-05-24', 'Online',              'Online',      5),
  ('클럽 A.O.R',                             'Club A.O.R',                             '2020-09-25', '클럽 A.O.R',          'Seoul',       4),
  ('제4회 All Star 뮤지션 페스티벌',          '4th All Star Musician Festival',         '2020-10-15', '세종문화회관',         'Seoul',       2),
  ('클럽 A.O.R',                             'Club A.O.R',                             '2020-10-24', '클럽 A.O.R',          'Seoul',       4),
  ('에반스라운지 공연',                        'Evans Lounge',                           '2020-11-20', '에반스라운지',         'Seoul',       4),

  -- ========== 2021 ==========
  ('클럽 A.O.R 공연',                         'Club A.O.R',                             '2021-02-20', '클럽 A.O.R',          'Seoul',       4),
  ('유재하 음악대회 선정 기념 공연',            'Yoo Jae-ha Contest Commemorative Concert','2021-03-19', '펫사운즈',            'Seoul',       4),
  ('펫사운즈 공연',                            'Pet Sounds',                             '2021-04-02', '펫사운즈',            'Seoul',       4),
  ('KT&G 상상마당 밴드의 시대 온라인 라이브',  'Band Era Online Live',                   '2021-04-09', 'Online',              'Online',      5),
  ('2021 뮤니브 콘서트 REBOOT',               '2021 Munive Concert REBOOT',             '2021-05-29', '미정',                'Seoul',       2),
  ('2021 아무공연 온라인 라이브',              '2021 Amu Concert Online',                '2021-06-03', 'Online',              'Online',      5),
  ('클럽 A.O.R 공연',                         'Club A.O.R',                             '2021-06-05', '클럽 A.O.R',          'Seoul',       4),
  ('네스트나다 공연',                          'Nestnada',                               '2021-06-18', '네스트나다',          'Seoul',       4),
  ('2021 인디열전 : 터치드 We are Touched',   '2021 Indie Festival : We are Touched',   '2021-11-05', '마포아트센터',         'Seoul',       1),

  -- ========== 2022 ==========
  ('T Factory X FLO 덕콘',                   'T Factory X FLO Fan Concert',           '2022-01-08', 'T Factory',           'Seoul',       4),
  ('허니비치 공연',                            'Honey Beach',                            '2022-03-26', '허니비치',            'Seoul',       4),
  ('Touched your heart 롤링 27주년 기념공연', 'Rolling 27th Anniversary Concert',      '2022-04-29', '롤링홀',              'Seoul',       4),
  ('Festival NADA',                          'Festival NADA',                          '2022-05-22', '미정',                'Seoul',       2),
  ('OCTOPOP 2022 태국',                       'OCTOPOP 2022',                           '2022-10-15', 'Show DC Hall',        'Bangkok, Thailand', 2),
  ('K-MUSIC PYEONGCHANG',                    'K-MUSIC PYEONGCHANG',                   '2022-11-18', '알펜시아 콘서트홀',    'Pyeongchang', 4),
  ('한일우호 공연 Day 1',                     'Korea-Japan Friendship Concert Day 1',  '2022-12-13', '미정',                'Japan',       4),
  ('한일우호 공연 Day 2',                     'Korea-Japan Friendship Concert Day 2',  '2022-12-14', '미정',                'Japan',       4),
  ('COUNTDOWN FANTASY 2022-2023',            'Countdown Fantasy 2022-2023',           '2022-12-31', 'KINTEX',              'Goyang-si',   2),

  -- ========== 2023 ==========
  ('타임스퀘어 문화공연',                      'Times Square Cultural Performance',     '2023-01-21', '타임스퀘어',           'Seoul',       4),
  ('대구 벚꽃 스캔들',                         'Daegu Cherry Blossom Scandal',          '2023-03-25', '미정',                'Daegu',       2),
  ('강동문화재단 Dear Next Generation',        'Dear Next Generation',                  '2023-03-31', '강동아트센터',         'Seoul',       4),
  ('너나나시리즈 [The Moment]',               'You Me Us Series [The Moment]',         '2023-08-23', '미정',                'Seoul',       4),
  ('2023 조이올팍페스티벌',                   'Joy Olpark Festival 2023',              '2023-09-16', '올림픽공원 88잔디마당','Seoul',       2),
  ('너나나시리즈 THE MOMENT',                 'You Me Us Series THE MOMENT',           '2023-09-19', '미정',                'Seoul',       4),
  ('울산 중구 문화의 전당 터치드 콘서트',       'Ulsan Jung-gu Cultural Center Concert', '2023-12-09', '울산 중구 문화의 전당', 'Ulsan',      1),

  -- ========== 2024 ==========
  ('튠업 25기 Showcase',                     'Tune-Up 25th Showcase',                 '2024-05-22', 'CJ Azit',             'Seoul',       4),
  ('VISION BANGKOK',                         'VISION BANGKOK',                         '2024-06-08', '미정',                'Bangkok, Thailand', 4),
  ('튠업 25기 선정기념 공연',                  'Tune-Up 25th Selection Concert',        '2024-06-19', 'CJ Azit',             'Seoul',       4),
  ('GAC 기획공연 터치드 Live in 광주',         'Touched Live in Gwangju',               '2024-06-22', '광주 ACC',            'Gwangju',     4),
  ('강릉버스킹전국대회 왕의탄생',              'Gangneung Busking Contest',             '2024-07-27', '강릉 중앙시장',        'Gangneung',   4),
  ('KT Voyage to Jarasum',                   'KT Voyage to Jarasum',                  '2024-08-31', '자라섬',              'Gapyeong',    2),
  ('뮤즈온 라이브 위크',                       'MUSE ON Live Week',                     '2024-09-04', '미정',                'Seoul',       4),
  ('제주레저힐링축제',                         'Jeju Leisure Healing Festival',         '2024-09-08', '제주월드컵경기장',      'Jeju',        2),
  ('Look at ME 청년 마음 축제',               'Look at ME Youth Festival',             '2024-10-19', '미정',                'Seoul',       4),
  ('강릉아트센터 연말콘서트',                   'Gangneung Arts Center Year-End Concert','2024-12-28', '강릉아트센터',         'Gangneung',   4),

  -- ========== 2025 ==========
  ('COUNTDOWN FANTASY 2024-2025',            'Countdown Fantasy 2024-2025',           '2025-01-01', 'KINTEX',              'Goyang-si',   2),
  ('ON THE K : B',                           'ON THE K : B',                          '2025-02-07', '미정',                'Seoul',       4),
  ('2025 불후의 명곡 록 페스티벌 울산',         '2025 Immortal Song Rock Festival Ulsan','2025-07-19', '태화강국가정원',        'Ulsan',       4),
  ('인천 PENTAPORT ROCK FESTIVAL 2025',      'Incheon Pentaport Rock Festival 2025',  '2025-08-04', '송도달빛축제공원',      'Incheon',     2),
  ('K-Music Night',                          'K-Music Night',                         '2025-08-06', '미정',                'International', 4),
  ('ACC 엑스뮤직페스티벌',                    'ACC X Music Festival',                  '2025-08-31', '국립아시아문화전당',    'Gwangju',     2),
  ('뮤즈온 페스티벌',                          'MUSE ON Festival',                      '2025-09-02', '미정',                'Seoul',       2),
  ('VISION BANGKOK 2025',                    'VISION BANGKOK 2025',                   '2025-09-13', '미정',                'Bangkok, Thailand', 4),
  ('2025 포항시 대학연합축제',                 '2025 Pohang University Festival',       '2025-11-15', '미정',                'Pohang',       2),
  ('go(90) SCNU Glocal Youth Festa',         'go(90) SCNU Glocal Youth Festa',        '2025-12-04', '순천대학교',           'Suncheon',    4),

  -- ========== 2026 ==========
  ('MPMG WEEK [BACK TO 2019]',               'MPMG WEEK [BACK TO 2019]',              '2026-02-08', 'Musinsa Garage',      'Seoul',       4),
  ('MPMG WEEK [B.에 관한 고찰2]',             'MPMG WEEK',                             '2026-02-10', 'Musinsa Garage',      'Seoul',       4),
  ('MPMG WEEK [엠피엠집 집들이]',              'MPMG WEEK',                             '2026-02-12', 'Musinsa Garage',      'Seoul',       4),
  ('경록절 클래식-로큰롤 다이너마이트',          'Gyeongrokjeol Classic Rock N Roll',     '2026-02-20', '미정',                'Seoul',       4),
  ('KIA TIGERS 홈 개막 시리즈',              'KIA Tigers Home Opening Series',        '2026-04-03', '광주-기아 챔피언스 필드','Gwangju',     4),
  ('2026 한강대학가요제',                      '2026 Hangang University Song Festival', '2026-05-02', '한강',                'Seoul',       2),
  ('2026 Weverse Con Festival',              '2026 Weverse Con Festival',             '2026-06-07', '미정',                'Seoul',       2)

ON CONFLICT (performanceDate) DO NOTHING;

-- ============================================
-- ※ 날짜 충돌 주의사항:
--   2025-01-01 COUNTDOWN FANTASY 2024-2025
--     → DB에 이미 2024-12-31로 등록된 같은 이벤트가 있을 수 있음
--     → 나무위키 날짜 기준으로 2025-01-01 추가 (별도 레코드)
--   2025-08-04 Pentaport
--     → setlist.fm에는 08-01로 기록 (기존 DB: 08-01)
--     → 나무위키 기준 08-04 추가 (ON CONFLICT로 중복 방지)
-- ============================================
-- 확인 쿼리:
-- SELECT COUNT(*) FROM SCHEDULES;
-- SELECT performanceDate, title, titleEng, city FROM SCHEDULES ORDER BY performanceDate;
-- ============================================
