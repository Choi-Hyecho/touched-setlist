-- ============================================
-- SCHEDULES 제목 컬럼 한국어/영어 분리 마이그레이션
-- ============================================
-- title    → 한국어 공연명 (신규)
-- titleEng → 영어 공연명 (기존 title 컬럼 이름 변경)
-- ============================================

-- STEP 1: 기존 title 컬럼 → titleEng 로 이름 변경
ALTER TABLE SCHEDULES RENAME COLUMN title TO titleEng;

-- STEP 2: 한국어 title 컬럼 추가 (일단 nullable)
ALTER TABLE SCHEDULES ADD COLUMN title VARCHAR(255);

-- ============================================
-- STEP 3: 날짜 기준으로 한국어 제목 업데이트
-- ============================================

UPDATE SCHEDULES SET title = CASE performanceDate::text

  -- 2021
  WHEN '2021-08-27' THEN '터치드 at Unplugged Hongdae'
  WHEN '2021-10-22' THEN '터치드 at Prism Hall'

  -- 2022
  WHEN '2022-09-17' THEN '2022 LOVESOME - 보통의 언어들'
  WHEN '2022-10-23' THEN '2022 그랜드 민트 페스티벌'

  -- 2023
  WHEN '2023-01-29' THEN 'Awesome Stage 2회차'
  WHEN '2023-02-04' THEN '민트 페스타 vol.68'
  WHEN '2023-04-22' THEN '2023 LOVESOME - 불편한 편의점 페스티벌'
  WHEN '2023-05-06' THEN '어썸 스테이지'
  WHEN '2023-05-14' THEN '뷰티풀 민트 페스티벌 2023'
  WHEN '2023-05-28' THEN 'PEAK FESTIVAL 2023'
  WHEN '2023-07-15' THEN '2023 불후의 명곡 록 페스티벌 울산'
  WHEN '2023-07-22' THEN '2023 사운드베리 페스타'
  WHEN '2023-09-09' THEN 'MU:CON 2023 SHOWCASE'
  WHEN '2023-09-23' THEN '평화누리 피크닉 페스티벌'
  WHEN '2023-10-07' THEN '2023 부산국제록페스티벌'
  WHEN '2023-10-14' THEN '경기인디뮤직페스티벌 2023'
  WHEN '2023-10-22' THEN '2023 그랜드 민트 페스티벌'
  WHEN '2023-11-26' THEN 'Very Festival 2023'
  WHEN '2023-12-31' THEN 'Countdown Fantasy 2023'

  -- 2024
  WHEN '2024-01-13' THEN '터치드 단독 콘서트 Day 1'
  WHEN '2024-01-14' THEN '터치드 단독 콘서트 Day 2'
  WHEN '2024-02-05' THEN 'MPMG WEEK [BLUE LABEL]'
  WHEN '2024-04-14' THEN 'LOUD BRIDGE'
  WHEN '2024-05-12' THEN '2024 뷰티풀 민트 페스티벌'
  WHEN '2024-06-15' THEN '터치드 단독 콘서트 Day 1'
  WHEN '2024-06-16' THEN '터치드 단독 콘서트 Day 2'
  WHEN '2024-06-27' THEN '2024 K-INDIE ON The Second Wave'
  WHEN '2024-06-29' THEN '2024 K-INDIE ON The Second Wave'
  WHEN '2024-07-06' THEN '2024 ROUND FESTIVAL in KOREA'
  WHEN '2024-08-03' THEN '어썸스테이지 정용화 x TOUCHED 대구'
  WHEN '2024-08-04' THEN 'PENTAPORT ROCK FESTIVAL 2024'
  WHEN '2024-08-10' THEN 'GS25 뮤비페 부산'
  WHEN '2024-08-16' THEN '파리올림픽 영웅들의 무대'
  WHEN '2024-09-07' THEN 'Someday Festival 2024'
  WHEN '2024-09-19' THEN 'Reeperbahn Festival 2024'
  WHEN '2024-10-05' THEN '2024 부산국제록페스티벌'
  WHEN '2024-10-06' THEN '하나플레이리스트 콘서트'
  WHEN '2024-10-12' THEN '2024 경기인디뮤직페스티벌'
  WHEN '2024-10-26' THEN '2024 그랜드 민트 페스티벌'
  WHEN '2024-11-05' THEN 'KBS 홀 녹화'
  WHEN '2024-11-08' THEN 'WONDERLIVET 2024 고양'
  WHEN '2024-11-17' THEN 'LIVE ON FTISLAND X TOUCHED 부산'
  WHEN '2024-12-22' THEN 'Someday Christmas 여수'
  WHEN '2024-12-25' THEN 'Someday Christmas 부산'
  WHEN '2024-12-31' THEN 'COUNTDOWN FANTASY 2024-2025'

  -- 2025
  WHEN '2025-01-25' THEN '터치드 단독 콘서트 Day 1'
  WHEN '2025-01-26' THEN '터치드 단독 콘서트 Day 2'
  WHEN '2025-02-13' THEN 'MPMG WEEK [BLUE LABEL]'
  WHEN '2025-03-29' THEN 'THE GLOW 2025'
  WHEN '2025-04-27' THEN '2025 LOVESOME - 반 고흐, 영혼의 편지'
  WHEN '2025-05-17' THEN '그린캠프 페스티벌 2025'
  WHEN '2025-05-24' THEN 'PEAK FESTIVAL 2025'
  WHEN '2025-06-13' THEN '뷰티풀 민트 라이프 2025'
  WHEN '2025-06-21' THEN '2025 ROUND FESTIVAL in Malaysia'
  WHEN '2025-07-27' THEN 'SBS 가요대전 Summer'   -- ※ 나무위키: 07-19, setlist.fm: 07-27
  WHEN '2025-08-01' THEN '인천 PENTAPORT ROCK FESTIVAL 2025'  -- ※ 나무위키: 08-04
  WHEN '2025-08-23' THEN 'TOUCHED CONCERT [ATTRACTION] Day 1'
  WHEN '2025-08-24' THEN 'TOUCHED CONCERT [ATTRACTION] Day 2'
  WHEN '2025-09-06' THEN 'LOVE CHIPS FESTIVAL 2025'
  WHEN '2025-09-09' THEN 'KBS 홀 녹화'
  WHEN '2025-09-21' THEN 'KB 조이올팍 페스티벌 2025'
  WHEN '2025-09-28' THEN '2025 부산국제록페스티벌'
  WHEN '2025-10-18' THEN 'Grand Mint Festival 2025'
  WHEN '2025-10-28' THEN 'IFWY U&I Concert 2025'
  WHEN '2025-11-01' THEN '2025 서울뮤직페스티벌'
  WHEN '2025-11-08' THEN '2025 NAVER K-BASEBALL SERIES 특별공연'
  WHEN '2025-11-09' THEN '인디스땅스 10주년 기념공연'
  WHEN '2025-11-28' THEN '수능 힐링 콘서트'
  WHEN '2025-12-10' THEN '논산 청소년 연말축제'
  WHEN '2025-12-27' THEN 'Someday Christmas 2025'
  WHEN '2025-12-31' THEN 'COUNTDOWN FANTASY 2025-2026'

  -- 2026
  WHEN '2026-01-10' THEN '터치드 단독 콘서트 Day 1'
  WHEN '2026-01-11' THEN '터치드 단독 콘서트 Day 2'
  WHEN '2026-02-01' THEN 'FIRST MUSIC STATION 2026'
  WHEN '2026-02-28' THEN 'EMERGE FEST 2026'
  WHEN '2026-03-22' THEN 'THE GLOW 2026'
  WHEN '2026-03-27' THEN 'CJ문화재단 20주년 기념 라이브클럽데이'
  WHEN '2026-04-12' THEN '2026 LOVESOME - 조선미술관'
  WHEN '2026-04-19' THEN 'GREENCAMP FESTIVAL 2026'
  WHEN '2026-05-30' THEN 'Beautiful Mint Life 2026'

  ELSE titleEng  -- 한국어 미확인 → 영어 제목으로 fallback
END;

-- STEP 4: title이 NULL인 경우 titleEng으로 채우기 (안전장치)
UPDATE SCHEDULES SET title = titleEng WHERE title IS NULL;

-- ============================================
-- 확인 쿼리:
-- SELECT performanceDate, title, titleEng FROM SCHEDULES ORDER BY performanceDate;
-- ============================================
