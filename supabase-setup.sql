-- ============================================
-- Touched Setlist Archive - Database Setup
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. USERS 테이블 생성
CREATE TABLE USERS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_is_admin ON USERS(is_admin);

-- 2. SCHEDULE_TYPES 테이블 생성
CREATE TABLE SCHEDULE_TYPES (
  id SERIAL PRIMARY KEY,
  type_name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SCHEDULES 테이블 생성
CREATE TABLE SCHEDULES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,      -- 한국어 공연명
  titleEng VARCHAR(255),            -- 영어 공연명
  description TEXT,
  performanceDate DATE NOT NULL UNIQUE,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  schedule_type_id INTEGER REFERENCES SCHEDULE_TYPES(id) ON DELETE SET NULL,
  posterUrl VARCHAR(500),
  remarks TEXT,
  created_by UUID REFERENCES USERS(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_date ON SCHEDULES(performanceDate DESC);
CREATE INDEX idx_schedules_type ON SCHEDULES(schedule_type_id);
CREATE INDEX idx_schedules_created_by ON SCHEDULES(created_by);

-- 4. ALBUMS 테이블 생성
CREATE TABLE ALBUMS (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(100) NOT NULL UNIQUE,
  albumType   VARCHAR(20),   -- 'EP', 'Single', 'Full Album', 'Compilation', 'TV'
  releaseYear INTEGER,
  albumArtUrl VARCHAR(500),
  spotifyUrl  VARCHAR(500),
  melonUrl    VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_albums_title ON ALBUMS(title);
CREATE INDEX idx_albums_year  ON ALBUMS(releaseYear DESC);

-- 5. SONGS 테이블 생성
CREATE TABLE SONGS (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL UNIQUE,
  artist       VARCHAR(100) DEFAULT 'Touched',
  album_id     UUID REFERENCES ALBUMS(id) ON DELETE SET NULL,
  spotifyUrl   VARCHAR(500),
  appleMusicUrl VARCHAR(500),
  melonUrl     VARCHAR(500),
  genieUrl     VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_songs_title    ON SONGS(title);
CREATE INDEX idx_songs_album_id ON SONGS(album_id);

-- 6. SETLISTS 테이블 생성
CREATE TABLE SETLISTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES SCHEDULES(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES SONGS(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(schedule_id, song_id)
);

CREATE INDEX idx_setlists_schedule ON SETLISTS(schedule_id);
CREATE INDEX idx_setlists_song ON SETLISTS(song_id);
CREATE INDEX idx_setlists_order ON SETLISTS(schedule_id, "order");

-- 7. SONG_STATS 테이블 생성 (통계용)
CREATE TABLE SONG_STATS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES SONGS(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  playCount INTEGER DEFAULT 0,
  totalPerformances INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(song_id, year)
);

CREATE INDEX idx_song_stats_year ON SONG_STATS(year);
CREATE INDEX idx_song_stats_playcount ON SONG_STATS(playCount DESC);

-- ============================================
-- 초기 데이터 입력
-- ============================================

-- 공연 타입 데이터
INSERT INTO SCHEDULE_TYPES (type_name, icon) VALUES
  ('단독 콘서트', '🎤'),
  ('페스티벌', '🎪'),
  ('방송 녹화', '📺'),
  ('특별 공연', '⭐'),
  ('온라인 공연', '💻'),
  ('콜라보레이션', '🤝')
ON CONFLICT (type_name) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) 정책 설정
-- ============================================

-- ALBUMS 테이블 RLS 활성화
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

-- SCHEDULES 테이블 RLS 활성화
ALTER TABLE SCHEDULES ENABLE ROW LEVEL SECURITY;

-- 누구나 공연 정보 조회 가능
CREATE POLICY "Allow public read schedules" 
  ON SCHEDULES FOR SELECT 
  USING (true);

-- 관리자만 공연 정보 생성/수정/삭제
CREATE POLICY "Allow admins insert schedules"
  ON SCHEDULES FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE
    )
  );

CREATE POLICY "Allow admins update schedules"
  ON SCHEDULES FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE
    )
  );

CREATE POLICY "Allow admins delete schedules"
  ON SCHEDULES FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE
    )
  );

-- SONGS 테이블 RLS 활성화
ALTER TABLE SONGS ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read songs"
  ON SONGS FOR SELECT
  USING (true);

CREATE POLICY "Allow admins manage songs"
  ON SONGS FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE
    )
  );

CREATE POLICY "Allow admins update songs"
  ON SONGS FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE
    )
  );

-- SETLISTS 테이블 RLS 활성화
ALTER TABLE SETLISTS ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read setlists"
  ON SETLISTS FOR SELECT
  USING (true);

CREATE POLICY "Allow admins manage setlists"
  ON SETLISTS FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE USERS.id = auth.uid() AND USERS.is_admin = TRUE
    )
  );

-- SCHEDULE_TYPES 테이블 RLS 활성화
ALTER TABLE SCHEDULE_TYPES ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read schedule_types"
  ON SCHEDULE_TYPES FOR SELECT
  USING (true);

-- ============================================
-- 함수 및 Trigger 생성
-- ============================================

-- 통계 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_song_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_song_id UUID;
  v_year    INTEGER;
BEGIN
  -- INSERT는 NEW, DELETE는 OLD 사용
  IF TG_OP = 'DELETE' THEN
    v_song_id := OLD.song_id;
    SELECT EXTRACT(YEAR FROM performanceDate)::INT
      INTO v_year FROM SCHEDULES WHERE id = OLD.schedule_id;
  ELSE
    v_song_id := NEW.song_id;
    SELECT EXTRACT(YEAR FROM performanceDate)::INT
      INTO v_year FROM SCHEDULES WHERE id = NEW.schedule_id;
  END IF;

  INSERT INTO SONG_STATS (song_id, year, playCount, totalPerformances)
  SELECT
    v_song_id,
    v_year,
    COUNT(*),
    (SELECT COUNT(*) FROM SCHEDULES
     WHERE EXTRACT(YEAR FROM performanceDate)::INT = v_year)
  FROM SETLISTS sl
  JOIN SCHEDULES s ON sl.schedule_id = s.id
  WHERE sl.song_id = v_song_id
    AND EXTRACT(YEAR FROM s.performanceDate)::INT = v_year
  ON CONFLICT (song_id, year) DO UPDATE SET
    playCount         = EXCLUDED.playCount,
    totalPerformances = EXCLUDED.totalPerformances,
    updated_at        = CURRENT_TIMESTAMP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- SETLIST 추가/삭제 시 통계 업데이트
CREATE TRIGGER trigger_update_stats_on_insert
  AFTER INSERT ON SETLISTS
  FOR EACH ROW
  EXECUTE FUNCTION update_song_stats();

CREATE TRIGGER trigger_update_stats_on_delete
  AFTER DELETE ON SETLISTS
  FOR EACH ROW
  EXECUTE FUNCTION update_song_stats();

-- ============================================
-- 뷰 생성 (선택사항)
-- ============================================

-- 공연 상세 정보 뷰
CREATE OR REPLACE VIEW view_performance_details AS
SELECT 
  s.id,
  s.title,
  s.description,
  s.performanceDate,
  s.venue,
  s.city,
  st.type_name,
  st.icon,
  s.posterUrl,
  s.remarks,
  COUNT(sl.id) AS song_count
FROM SCHEDULES s
LEFT JOIN SCHEDULE_TYPES st ON s.schedule_type_id = st.id
LEFT JOIN SETLISTS sl ON s.id = sl.schedule_id
GROUP BY s.id, st.id;

-- TOP 10 곡 통계 뷰
CREATE OR REPLACE VIEW view_top10_songs AS
WITH ranked_songs AS (
  SELECT 
    ss.song_id,
    s.title,
    s.album,
    ss.year,
    ss.playCount,
    RANK() OVER (PARTITION BY ss.year ORDER BY ss.playCount DESC) AS rank
  FROM SONG_STATS ss
  JOIN SONGS s ON ss.song_id = s.id
)
SELECT 
  song_id,
  title,
  album,
  year,
  playCount,
  rank
FROM ranked_songs
WHERE rank <= 10;

-- ============================================
-- 설정 완료!
-- ============================================
-- 이제 .env.local 파일을 설정하고
-- npm install을 실행하세요
-- ============================================
