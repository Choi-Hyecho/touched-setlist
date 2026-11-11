-- ============================================
-- SONGS.track_number 추가 마이그레이션
-- 앨범 수록 순서를 명시적으로 저장한다.
-- (지금까지는 DB 저장 순서대로 나와서, 곡의 앨범을 바꾸면 순서가 섞였음)
-- ============================================

ALTER TABLE songs ADD COLUMN IF NOT EXISTS track_number INT;

-- 극야 앨범 수록 순서
-- 제목은 대소문자·공백을 무시하고 매칭 ("이 별" = "이별", "(TITLE)" 표기는 제외하고 비교)
WITH tracks(title, n) AS (
  VALUES
    ('터널', 1),
    ('Fallen Angel', 2),
    ('이 별', 3),
    ('미아', 4),
    ('영혼의 밤', 5),
    ('Shibuya Scramble', 6),
    ('Liar', 7),
    ('TANTARA', 8),
    ('Stay by My Side', 9),
    ('Alone', 10),
    ('Save Me', 11),
    ('At Home', 12)
)
UPDATE songs s
SET track_number = t.n
FROM tracks t, albums a
WHERE s.album_id = a.id
  AND a.title LIKE '%극야%'
  AND regexp_replace(lower(regexp_replace(s.title, '\(TITLE\)', '', 'i')), '\s', '', 'g')
    = regexp_replace(lower(t.title), '\s', '', 'g');

-- 확인용: 12곡 모두 번호가 붙었는지 보기 (track_number가 비어 있는 곡이 있으면 제목이 다른 것)
SELECT s.track_number, s.title, a.title AS album
FROM songs s
JOIN albums a ON a.id = s.album_id
WHERE a.title LIKE '%극야%'
ORDER BY s.track_number NULLS LAST, s.title;
