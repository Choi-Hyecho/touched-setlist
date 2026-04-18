-- ============================================
-- Touched (터치드) 실제 공연 스케줄 + 세트리스트
-- 출처: setlist.fm/setlists/touched-13f95d45.html
-- Supabase SQL Editor에서 실행하세요
-- ※ 실행 전 supabase-songs-real.sql 먼저 실행 필요
-- ============================================
-- schedule_type_id:
--   1 = 단독 콘서트
--   2 = 페스티벌
--   3 = 방송 녹화
--   4 = 특별 공연
--   5 = 온라인 공연
-- ============================================

-- ============================================
-- PART 1: SCHEDULES
-- ============================================

INSERT INTO SCHEDULES (title, performanceDate, venue, city, schedule_type_id) VALUES

  -- 2021
  ('Touched at Unplugged Hongdae',              '2021-08-27', 'Unplugged Hongdae',                          'Seoul',              4),
  ('Touched at Prism Hall',                     '2021-10-22', 'Prism Hall',                                 'Seoul',              1),

  -- 2022
  ('2022 LOVESOME',                             '2022-09-17', 'Yonsei University Outdoor Theatre',          'Seoul',              2),
  ('Grand Mint Festival 2022',                  '2022-10-23', '88 Garden Stage (Olympic Park)',             'Seoul',              2),

  -- 2023
  ('KBS Arena Concert',                         '2023-01-29', 'KBS Arena',                                  'Seoul',              3),
  ('Mint Festa vol.68',                         '2023-02-04', 'Watcha Hall',                                'Seoul',              4),
  ('2023 LOVESOME',                             '2023-04-22', 'Olympic Stadium',                            'Seoul',              2),
  ('Touched at BEXCO',                          '2023-05-06', 'BEXCO Auditorium',                          'Busan',              1),
  ('Beautiful Mint Life 2023',                  '2023-05-14', 'Olympic Park (88 Garden Stage)',             'Seoul',              2),
  ('Peak Festival 2023',                        '2023-05-28', 'Nanji Hangang Park',                        'Seoul',              2),
  ('2023 Immortal Songs Rock Festival',         '2023-07-15', 'Taehwagang National Garden',                'Ulsan',              4),
  ('Soundberry Festa ''23',                     '2023-07-22', 'KBS Arena',                                  'Seoul',              2),
  ('MU:CON SEOUL 2023',                         '2023-09-09', 'Shinhan pLay Square',                       'Seoul',              4),
  ('Pyeonghwa Nuri Picnic Festival 2023',       '2023-09-23', 'Imjingak Pyeonghwa Nuri Park',              'Paju',               2),
  ('Busan International Rock Festival 2023',    '2023-10-07', 'Samnak Ecological Park',                    'Busan',              2),
  ('Gyeonggi Indie Music Festival 2023',        '2023-10-14', 'Ansan Wa~ Stadium',                         'Ansan',              2),
  ('Grand Mint Festival 2023',                  '2023-10-22', 'Olympic Park (88 Garden Stage)',             'Seoul',              2),
  ('Very Festival 2023',                        '2023-11-26', 'Queen Sirikit National Convention Center',  'Bangkok, Thailand',  2),
  ('Countdown Fantasy 2023',                    '2023-12-31', 'KINTEX',                                    'Goyang-si',          2),

  -- 2024
  ('Touched at Blue Square Day 1',              '2024-01-13', 'Blue Square Mastercard Hall',               'Seoul',              1),
  ('Touched at Blue Square Day 2',              '2024-01-14', 'Blue Square Mastercard Hall',               'Seoul',              1),
  ('MPMG Week 2024',                            '2024-02-05', 'CJ Azit Gwangheungchang',                   'Seoul',              4),
  ('LOUD BRIDGE FESTIVAL SEOUL 2024',           '2024-04-14', 'YES24 Live Hall',                           'Seoul',              2),
  ('Beautiful Mint Life 2024',                  '2024-05-12', 'SK Olympic Handball Arena',                 'Seoul',              2),
  ('Touched at Myunghwa Live Hall Day 1',       '2024-06-15', 'Myunghwa Live Hall',                        'Seoul',              1),
  ('Touched at Myunghwa Live Hall Day 2',       '2024-06-16', 'Myunghwa Live Hall',                        'Seoul',              1),
  ('Touched at Gruenspan',                      '2024-06-27', 'Gruenspan',                                 'Hamburg, Germany',   4),
  ('Touched at Kesselhaus',                     '2024-06-29', 'Kesselhaus',                                'Berlin, Germany',    4),
  ('2024 ROUND in KOREA',                       '2024-07-06', 'KBS Busan Hall',                            'Busan',              4),
  ('Kyungpook National University Concert',     '2024-08-03', 'Kyungpook National University',             'Daegu',              4),
  ('Incheon Pentaport Rock Festival 2024',      '2024-08-04', 'Songdo Moonlight Festival Park',            'Incheon',            2),
  ('GS25 Music & Beer Festival Busan 2024',     '2024-08-10', 'Hall of Film Dureraum Square',              'Busan',              2),
  ('Paris Olympic Festival: Heroes of Paris',   '2024-08-16', 'Yeouido Park',                              'Seoul',              4),
  ('Someday Festival 2024',                     '2024-09-07', 'Nanji Hangang Park',                        'Seoul',              2),
  ('Reeperbahn Festival 2024',                  '2024-09-19', 'Spielbudenplatz',                           'Hamburg, Germany',   2),
  ('Busan International Rock Festival 2024',    '2024-10-05', 'Samnak Ecological Park',                    'Busan',              2),
  ('Hana Bank Playlist Concert 2024',           '2024-10-06', 'Yonsei University Outdoor Theatre',         'Seoul',              4),
  ('Gyeonggi Indie Music Festival 2024',        '2024-10-12', 'Imjingak',                                  'Paju',               2),
  ('Grand Mint Festival 2024',                  '2024-10-26', 'Olympic Park (88 Garden Stage)',             'Seoul',              2),
  ('KBS Hall',                                  '2024-11-05', 'KBS Hall',                                  'Seoul',              3),
  ('WONDERLIVET 2024',                          '2024-11-08', 'KINTEX',                                    'Goyang-si',          2),
  ('KBS Busan Hall',                            '2024-11-17', 'KBS Busan Hall',                            'Busan',              3),
  ('Someday Christmas in Yeosu 2024',           '2024-12-22', 'Jinnam Arena',                              'Yeosu',              4),
  ('Someday Christmas in Busan 2024',           '2024-12-25', 'BEXCO',                                     'Busan',              4),
  ('Countdown Fantasy 2024',                    '2024-12-31', 'KINTEX',                                    'Goyang-si',          2),

  -- 2025
  ('Touched at Olympic Hall Day 1',             '2025-01-25', 'Olympic Hall',                              'Seoul',              1),
  ('Touched at Olympic Hall Day 2',             '2025-01-26', 'Olympic Hall',                              'Seoul',              1),
  ('MPMG WEEK 2025 - BLUE LABEL',              '2025-02-13', 'Musinsa Garage',                            'Seoul',              4),
  ('The Glow 2025',                             '2025-03-29', 'KINTEX Hall 9',                             'Goyang-si',          2),
  ('2025 LOVESOME',                             '2025-04-27', 'Nanji Hangang Park',                        'Seoul',              2),
  ('GREENCAMP FESTIVAL 2025',                   '2025-05-17', 'Songdo Moonlight Festival Park',            'Incheon',            2),
  ('Peak Festival 2025',                        '2025-05-24', 'Nanji Hangang Park',                        'Seoul',              2),
  ('Beautiful Mint Life 2025',                  '2025-06-13', 'Olympic Park (88 Garden Stage)',             'Seoul',              2),
  ('ROUND in Malaysia 2025',                    '2025-06-21', 'Zepp Kuala Lumpur',                         'Kuala Lumpur, Malaysia', 4),
  ('SBS Gayo Daejeon 2025 Summer',              '2025-07-27', 'KINTEX',                                    'Goyang-si',          3),
  ('Incheon Pentaport Rock Festival 2025',      '2025-08-01', 'Songdo Moonlight Festival Park',            'Incheon',            2),
  ('TOUCHED CONCERT [ATTRACTION] Day 1',        '2025-08-23', 'KINTEX Hall 10',                            'Goyang-si',          1),
  ('TOUCHED CONCERT [ATTRACTION] Day 2',        '2025-08-24', 'KINTEX Hall 10',                            'Goyang-si',          1),
  ('Love Chips Festival 2025',                  '2025-09-06', 'Sangsang Platform',                         'Incheon',            2),
  ('KBS Hall',                                  '2025-09-09', 'KBS Hall',                                  'Seoul',              3),
  ('KB Joy Olpark Festival 2025',               '2025-09-21', 'Olympic Park (88 Garden Stage)',             'Seoul',              2),
  ('Busan International Rock Festival 2025',    '2025-09-28', 'Samnak Ecological Park',                    'Busan',              2),
  ('Grand Mint Festival 2025',                  '2025-10-18', 'KSPO DOME',                                 'Seoul',              2),
  ('IFWY U&I Concert 2025',                     '2025-10-28', 'Gyeongbokgung Palace',                      'Seoul',              4),
  ('SEOUL MUSIC FESTIVAL 2025',                 '2025-11-01', 'Oil Tank Culture Park',                     'Seoul',              2),
  ('Touched at Gocheok Sky Dome',               '2025-11-08', 'Gocheok Sky Dome',                          'Seoul',              4),
  ('Touched at Musinsa Garage',                 '2025-11-09', 'Musinsa Garage',                            'Seoul',              4),
  ('Hwacheon Gymnasium Concert',                '2025-11-28', 'Hwacheon Gymnasium',                        'Hwacheon',           4),
  ('Nonsan Youth Year-End Festival 2025',       '2025-12-10', 'Nonsan Army Training Center',               'Nonsan',             4),
  ('Someday Christmas 2025',                    '2025-12-27', 'BEXCO',                                     'Busan',              4),
  ('Countdown Fantasy 2025',                    '2025-12-31', 'KINTEX Hall 6',                             'Goyang-si',          2),

  -- 2026
  ('Touched at ticketLINK Live Arena Day 1',    '2026-01-10', 'ticketLINK Live Arena',                     'Seoul',              1),
  ('Touched at ticketLINK Live Arena Day 2',    '2026-01-11', 'ticketLINK Live Arena',                     'Seoul',              1),
  ('2026 FIRST MUSIC STATION',                  '2026-02-01', 'KINTEX Hall 10',                            'Goyang-si',          2),
  ('EMERGE FEST 2026',                          '2026-02-28', 'Taichung Qingshui Aofengshan Sports Park', 'Taichung, Taiwan',   2),
  ('The Glow 2026',                             '2026-03-22', 'KINTEX Hall 9',                             'Goyang-si',          2),
  ('79th Live Club Day',                        '2026-03-27', 'Musinsa Garage',                            'Seoul',              4),
  ('2026 LOVESOME',                             '2026-04-12', 'Yonsei University Outdoor Theatre',         'Seoul',              2),
  ('Green Camp Festival 2026',                  '2026-04-19', 'Jisan Forest Resort',                       'Icheon',             2),
  ('Beautiful Mint Life 2026',                  '2026-05-30', 'Oil Tank Culture Park',                     'Seoul',              2)

ON CONFLICT (performanceDate) DO NOTHING;


-- ============================================
-- PART 2: SETLISTS
-- ※ 세트리스트 미기재 공연은 제외
-- ※ 커버곡·미발매곡은 자동으로 JOIN에서 제외됨
-- ============================================

-- 2021-10-22 Prism Hall
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2021-10-22'), sg.id, t.ord
FROM (VALUES ('Back to you',1),('Love is Dangerous',2),('Blue',3),('Regret',4),('새벽별',5),('촛불',6),('Call Me',7),('Hi Bully',8)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2022-10-23 Grand Mint Festival 2022
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2022-10-23'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Alive',2),('새벽별',3),('Love is Dangerous',4),('Highlight',5)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2023-02-04 Mint Festa vol.68
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2023-02-04'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('불시',2),('Blue',3),('새벽별',4),('Alive',5),('Love is Dangerous',6),('Highlight',7)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2023-05-14 Beautiful Mint Life 2023
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2023-05-14'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Alive',2),('불시',3),('촛불',4),('새벽별',5),('Shut Down',6),('Love is Dangerous',7),('Highlight',8)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2023-09-09 MU:CON SEOUL 2023
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2023-09-09'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('야경',2),('Stand Up!',3)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2023-10-22 Grand Mint Festival 2023
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2023-10-22'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Bad Sniper',2),('불시',3),('야경',4),('Highlight',5)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2023-12-31 Countdown Fantasy 2023
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2023-12-31'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Bad Sniper',2),('야경',3),('새벽별',4),('Shut Down',5),('Highlight',6),('Love is Dangerous',7),('Stand Up!',8)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-05-12 Beautiful Mint Life 2024
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-05-12'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Alive',2),('불시',3),('야경',4),('반딧불이',5),('Shut Down',6),('새벽별',7),('Bad Sniper',8),('Love is Dangerous',9),('Highlight',10),('Stand Up!',11)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-06-29 Kesselhaus (Berlin)
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-06-29'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Alive',2),('불시',3),('Shut Down',4),('야경',5),('새벽별',6),('Bad Sniper',7),('Love is Dangerous',8),('반딧불이',9),('Stand Up!',10),('Highlight',11)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-07-06 2024 ROUND in KOREA
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-07-06'), sg.id, t.ord
FROM (VALUES ('Highlight',1)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-08-04 Incheon Pentaport Rock Festival 2024
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-08-04'), sg.id, t.ord
FROM (VALUES ('반딧불이',1),('Hi Bully',2),('불시',3),('야경',4),('Love is Dangerous',5),('Highlight',6),('Stand Up!',7)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-08-16 Paris Olympic Festival
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-08-16'), sg.id, t.ord
FROM (VALUES ('야경',1),('Highlight',2)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-10-05 Busan International Rock Festival 2024
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-10-05'), sg.id, t.ord
FROM (VALUES ('Love is Dangerous',1),('Hi Bully',2),('불시',3),('촛불',4),('야경',5),('Addiction',6),('Highlight',7),('Stand Up!',8)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-10-26 Grand Mint Festival 2024
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-10-26'), sg.id, t.ord
FROM (VALUES ('Alive',1),('Hi Bully',2),('Addiction',3),('Blue',4),('여정',5),('Shut Down',6),('야경',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-11-05 KBS Hall
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-11-05'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Love is Dangerous',2)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-11-08 WONDERLIVET 2024
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-11-08'), sg.id, t.ord
FROM (VALUES ('Addiction',1),('Hi Bully',2),('불시',3),('새벽별',4),('야경',5),('Love is Dangerous',6),('Highlight',7),('Stand Up!',8)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2024-12-31 Countdown Fantasy 2024
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2024-12-31'), sg.id, t.ord
FROM (VALUES ('여정',1),('야경',2),('Addiction',3),('Hi Bully',4),('Blue',5),('새벽별',6),('Shut Down',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-02-13 MPMG WEEK 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-02-13'), sg.id, t.ord
FROM (VALUES ('Highlight',1),('얼음요새',2),('Dive (Feat. 서사무엘)',3),('Last Day',4),('야경',5),('Love is Dangerous',6),('Hi Bully',7),('Stand Up!',8),('Alive',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-03-29 The Glow 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-03-29'), sg.id, t.ord
FROM (VALUES ('Last Day',1),('Alive',2),('반딧불이',3),('야경',4),('Shut Down',5),('Hi Bully',6),('Love is Dangerous',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-04-27 2025 LOVESOME
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-04-27'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Addiction',2),('Bad Sniper',3),('새벽별',4),('촛불',5),('야경',6),('Last Day',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-05-17 GREENCAMP FESTIVAL 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-05-17'), sg.id, t.ord
FROM (VALUES ('불시',1),('Hi Bully',2),('Alive',3),('야경',4),('Shut Down',5),('Dive (Feat. 서사무엘)',6),('새벽별',7),('Last Day',8),('Love is Dangerous',9),('Highlight',10)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-05-24 Peak Festival 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-05-24'), sg.id, t.ord
FROM (VALUES ('반딧불이',1),('야경',2),('여정',3),('Blue',4),('Hi Bully',5),('Love is Dangerous',6),('Last Day',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-06-13 Beautiful Mint Life 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-06-13'), sg.id, t.ord
FROM (VALUES ('Alive',1),('Hi Bully',2),('반딧불이',3),('Shut Down',4),('새벽별',5),('Blue',6),('Last Day',7),('Love is Dangerous',8),('Highlight',9),('Stand Up!',10),('달춤',11)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-06-21 ROUND in Malaysia 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-06-21'), sg.id, t.ord
FROM (VALUES ('Highlight',1),('Hi Bully',2),('야경',3),('Last Day',4),('Stand Up!',5)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-08-01 Incheon Pentaport Rock Festival 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-08-01'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Last Day',2),('Alive',3),('Bad Sniper',4),('Ruby',5),('야경',6),('Dynamite',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-09-06 Love Chips Festival 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-09-06'), sg.id, t.ord
FROM (VALUES ('Dynamite',1),('Hi Bully',2),('야경',3),('Ruby',4),('Get Back',5),('Highlight',6),('Stand Up!',7)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-09-09 KBS Hall
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-09-09'), sg.id, t.ord
FROM (VALUES ('Stand Up!',1),('Get Back',2)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-09-21 KB Joy Olpark Festival 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-09-21'), sg.id, t.ord
FROM (VALUES ('Ruby',1),('Hi Bully',2),('여정',3),('카세트테이프',4),('야경',5),('Dynamite',6),('Highlight',7),('Stand Up!',8)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-09-28 Busan International Rock Festival 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-09-28'), sg.id, t.ord
FROM (VALUES ('Get Back',1),('불시',2),('Last Day',3),('야경',4),('Ruby',5),('Hi Bully',6),('Dynamite',7),('Highlight',8),('Stand Up!',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-10-18 Grand Mint Festival 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-10-18'), sg.id, t.ord
FROM (VALUES ('Get Back',1),('Bad Sniper',2),('Last Day',3),('야경',4),('카세트테이프',5),('Ruby',6),('Hi Bully',7),('Love is Dangerous',8),('Dynamite',9),('Highlight',10),('Stand Up!',11)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-11-09 Musinsa Garage
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-11-09'), sg.id, t.ord
FROM (VALUES ('Alive',1),('Dynamite',2),('야경',3),('새벽별',4),('눈덩이',5),('Hi Bully',6),('Get Back',7),('Highlight',8),('Stand Up!',9),('달춤',10)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-11-28 Hwacheon Gymnasium
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-11-28'), sg.id, t.ord
FROM (VALUES ('Hi Bully',1),('Dynamite',2),('달춤',3),('야경',4),('Highlight',5),('Stand Up!',6)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2025-12-31 Countdown Fantasy 2025
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2025-12-31'), sg.id, t.ord
FROM (VALUES ('Stand Up!',1),('Dynamite',2),('Hi Bully',3),('카세트테이프',4),('달춤',5),('야경',6),('Ruby',7),('Highlight',8),('Last Day',9)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2026-02-01 2026 FIRST MUSIC STATION
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2026-02-01'), sg.id, t.ord
FROM (VALUES ('Addiction',1),('Bad Sniper',2),('Get Back',3),('Hi Bully',4),('Ruby',5),('달춤',6),('카세트테이프',7),('야경',8),('Stand Up!',9),('Dynamite',10),('Highlight',11),('여정',12)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- 2026-03-22 The Glow 2026
INSERT INTO SETLISTS (schedule_id, song_id, "order")
SELECT (SELECT id FROM SCHEDULES WHERE performanceDate = '2026-03-22'), sg.id, t.ord
FROM (VALUES ('Highlight',1),('Alive',2),('Hi Bully',3),('Dynamite',4),('촛불',5),('야경',6),('달춤',7),('Last Day',8),('Love is Dangerous',9),('Stand Up!',10)) AS t(stitle,ord)
JOIN SONGS sg ON sg.title = t.stitle
ON CONFLICT (schedule_id, song_id) DO NOTHING;

-- ============================================
-- 완료!
-- 확인 쿼리:
-- SELECT COUNT(*) FROM SCHEDULES;  -- 약 80개
-- SELECT COUNT(*) FROM SETLISTS;   -- 약 200개+
-- ============================================
