-- ============================================
-- ALBUMS 테이블 추가 마이그레이션
-- 이미 supabase-setup.sql + supabase-songs-real.sql을
-- 실행한 경우에 적용하세요.
-- ============================================
-- 변경 내용:
--   SONGS.album (varchar) → SONGS.album_id (FK → ALBUMS)
--   SONGS.albumArtUrl     → ALBUMS.albumArtUrl 으로 이동
-- ============================================

-- ============================================
-- STEP 1: ALBUMS 테이블 생성
-- ============================================

CREATE TABLE ALBUMS (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(100) NOT NULL UNIQUE,
  albumType    VARCHAR(20),   -- 'EP', 'Single', 'Full Album', 'Compilation', 'TV'
  releaseYear  INTEGER,
  albumArtUrl  VARCHAR(500),
  spotifyUrl   VARCHAR(500),
  melonUrl     VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_albums_title ON ALBUMS(title);
CREATE INDEX idx_albums_year ON ALBUMS(releaseYear DESC);

-- ============================================
-- STEP 2: 앨범 데이터 입력
-- ============================================

INSERT INTO ALBUMS (title, albumType, releaseYear) VALUES
  -- 싱글 (앨범명 = 곡명)
  ('새벽별',                   'Single',      2021),
  ('Regret',                   'Single',      2021),
  ('Addiction',                'Single',      2024),
  ('Last Day',                 'Single',      2024),
  ('달춤',                     'Single',      2025),
  ('너를 위해 부른다',          'Single',      2025),

  -- EP
  ('Purple',                   'EP',          2021),
  ('Yellow Supernova Remnant', 'EP',          2023),
  ('Red Signal',               'EP',          2025),

  -- 컴필/방송
  ('Great Seoul Invasion',     'Compilation', 2022),
  ('산울림 50주년 기념 프로젝트', 'Compilation', 2024),
  ('불후의 명곡',              'TV',          2024)

ON CONFLICT (title) DO NOTHING;

-- ============================================
-- STEP 3: SONGS에 album_id 컬럼 추가
-- ============================================

ALTER TABLE SONGS ADD COLUMN album_id UUID REFERENCES ALBUMS(id) ON DELETE SET NULL;

-- ============================================
-- STEP 4: 기존 album 문자열 → album_id FK 연결
-- ============================================

-- EP / Compilation / TV 앨범 (album 값이 앨범명과 동일한 경우)
UPDATE SONGS
SET album_id = (SELECT id FROM ALBUMS WHERE ALBUMS.title = SONGS.album)
WHERE SONGS.album IN (
  'Purple',
  'Yellow Supernova Remnant',
  'Red Signal',
  'Great Seoul Invasion',
  '산울림 50주년 기념 프로젝트',
  '불후의 명곡'
);

-- 싱글 (album = 'Single' → 곡명으로 앨범 조회)
UPDATE SONGS
SET album_id = (SELECT id FROM ALBUMS WHERE ALBUMS.title = SONGS.title)
WHERE SONGS.album = 'Single'
  AND EXISTS (SELECT 1 FROM ALBUMS WHERE ALBUMS.title = SONGS.title);

-- ============================================
-- STEP 5: 기존 컬럼 제거 (ALBUMS로 이동됨)
-- ============================================

ALTER TABLE SONGS DROP COLUMN album;
ALTER TABLE SONGS DROP COLUMN albumArtUrl;

-- ============================================
-- STEP 6: 인덱스 추가
-- ============================================

CREATE INDEX idx_songs_album_id ON SONGS(album_id);

-- ============================================
-- STEP 7: RLS 설정
-- ============================================

ALTER TABLE ALBUMS ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read albums"
  ON ALBUMS FOR SELECT USING (true);

CREATE POLICY "Allow admins insert albums"
  ON ALBUMS FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM USERS WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE)
  );

CREATE POLICY "Allow admins update albums"
  ON ALBUMS FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM USERS WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE)
  );

-- ============================================
-- 확인 쿼리
-- ============================================
-- 앨범별 곡 수 확인:
-- SELECT a.title, a.albumType, a.releaseYear, COUNT(s.id) as song_count
-- FROM ALBUMS a
-- LEFT JOIN SONGS s ON s.album_id = a.id
-- GROUP BY a.id ORDER BY a.releaseYear, a.title;

-- album_id 연결 안 된 곡 확인 (있으면 수동 처리 필요):
-- SELECT title FROM SONGS WHERE album_id IS NULL;
-- ============================================
