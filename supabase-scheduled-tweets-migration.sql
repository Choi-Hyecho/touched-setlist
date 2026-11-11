-- ============================================
-- SCHEDULED_TWEETS 테이블 추가 마이그레이션
-- 트위터 예약 발행 기능용
-- ============================================

CREATE TABLE scheduled_tweets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text          TEXT NOT NULL,
  image         TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'posted', 'failed')),
  tweet_id      TEXT,
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  posted_at     TIMESTAMPTZ
);

CREATE INDEX idx_scheduled_tweets_due ON scheduled_tweets(status, scheduled_at);

-- RLS 활성화, 공개 정책 없음: service role key(서버)로만 접근
ALTER TABLE scheduled_tweets ENABLE ROW LEVEL SECURITY;
