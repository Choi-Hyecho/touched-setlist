-- ============================================
-- Touched (터치드) 실제 곡 데이터
-- Supabase SQL Editor에서 실행하세요
-- 출처: Melon, NamuWiki, Spotify, setlist.fm
-- ============================================

INSERT INTO SONGS (title, artist, album, melonUrl, spotifyUrl) VALUES

  -- ========== 싱글 ==========
  ('새벽별', 'Touched', 'Single',
    'https://www.melon.com/song/detail.htm?songId=33218360', NULL),

  ('Regret', 'Touched', 'Single',
    'https://www.melon.com/song/detail.htm?songId=33423003', NULL),

  ('Addiction', 'Touched', 'Single',
    'https://www.melon.com/song/detail.htm?songId=38146272', NULL),

  ('Last Day', 'Touched', 'Single',
    'https://www.melon.com/song/detail.htm?songId=38327123', NULL),

  ('달춤', 'Touched', 'Single',
    'https://www.melon.com/song/detail.htm?songId=600506436', NULL),

  -- ========== EP 1집: Purple (2021.12.08) ==========
  ('Love is Dangerous', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377438', NULL),

  ('Hi Bully', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377440', NULL),

  ('Call Me', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377443', NULL),

  ('촛불', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377445', NULL),

  ('여정', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377439', NULL),

  ('Back to you', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377441', NULL),

  ('Where am I going', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377442', NULL),

  ('Blue', 'Touched', 'Purple',
    'https://www.melon.com/song/detail.htm?songId=34377444', NULL),

  -- ========== EP 2집: Yellow Supernova Remnant (2023.09.26) ==========
  ('Stand Up!', 'Touched', 'Yellow Supernova Remnant',
    'https://www.melon.com/song/detail.htm?songId=36823799', NULL),

  ('야경', 'Touched', 'Yellow Supernova Remnant',
    'https://www.melon.com/song/detail.htm?songId=36823800', NULL),

  ('반딧불이', 'Touched', 'Yellow Supernova Remnant',
    'https://www.melon.com/song/detail.htm?songId=36823801', NULL),

  ('Shut Down', 'Touched', 'Yellow Supernova Remnant',
    'https://www.melon.com/song/detail.htm?songId=36823802', NULL),

  ('Bad Sniper', 'Touched', 'Yellow Supernova Remnant',
    'https://www.melon.com/song/detail.htm?songId=36823803', NULL),

  -- ========== 그레이트 서울 인베이전 (2022) ==========
  ('Highlight', 'Touched', 'Great Seoul Invasion',
    'https://www.melon.com/song/detail.htm?songId=35539377', NULL),

  ('불시', 'Touched', 'Great Seoul Invasion',
    'https://www.melon.com/song/detail.htm?songId=35583196', NULL),

  ('Dive (Feat. 서사무엘)', 'Touched', 'Great Seoul Invasion',
    'https://www.melon.com/song/detail.htm?songId=35661225', NULL),

  ('얼음요새', 'Touched', 'Great Seoul Invasion',
    'https://www.melon.com/song/detail.htm?songId=35683731', NULL),

  ('Alive', 'Touched', 'Great Seoul Invasion',
    'https://www.melon.com/song/detail.htm?songId=35699213', NULL),

  ('Hi Bully (Acoustic ver.)', 'Touched', 'Great Seoul Invasion',
    'https://www.melon.com/song/detail.htm?songId=35699220', NULL),

  -- ========== EP 3집: Red Signal (2025.08.12) ==========
  -- Melon ID 미확인 — Spotify 링크로 대체
  ('Dynamite', 'Touched', 'Red Signal',
    NULL, 'https://open.spotify.com/track/2fiE8YZEQ1eoPoQjWbxg3d'),

  ('Get Back', 'Touched', 'Red Signal',
    NULL, 'https://open.spotify.com/track/1yz4XEfb8gf1OiyuSuEGIT'),

  ('Ruby', 'Touched', 'Red Signal',
    NULL, 'https://open.spotify.com/track/1pha3bEl2w7TmudxbEq9rN'),

  ('카세트테이프', 'Touched', 'Red Signal',
    NULL, 'https://open.spotify.com/track/662hbL9uYSqMoktZx9h324'),

  ('눈덩이', 'Touched', 'Red Signal',
    NULL, 'https://open.spotify.com/track/6LMaptJVpIGbi6lq9m6ZVj'),

  -- ========== 콜라보 & 기타 ==========
  ('나 어떡해', 'Touched', '산울림 50주년 기념 프로젝트',
    'https://www.melon.com/song/detail.htm?songId=37626999', NULL),

  ('서른 즈음에', 'Touched', '불후의 명곡',
    'https://www.melon.com/song/detail.htm?songId=601595863', NULL),

  ('너를 위해 부른다', 'Touched', 'Single',
    'https://www.melon.com/song/detail.htm?songId=600184994', NULL)

ON CONFLICT (title) DO NOTHING;

-- ============================================
-- 확인 쿼리
-- SELECT COUNT(*) FROM SONGS;
-- SELECT title, album FROM SONGS ORDER BY album, title;
-- ============================================
