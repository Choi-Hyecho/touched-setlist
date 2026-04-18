# 🗄️ Supabase 데이터베이스 설정 가이드

## 📋 단계별 설정

### **Step 1: Supabase 프로젝트 생성**

1. [supabase.com](https://supabase.com)에 접속
2. **Sign In** (없으면 Sign Up)
3. **New Project** 클릭

```
Organization: (새 조직 만들기 또는 선택)
Project Name: "touched-setlist"
Database Password: (안전한 비밀번호 설정) ⚠️ 저장!
Region: Asia-Seoul (또는 가장 가까운 지역)
Pricing Plan: Free
```

4. 프로젝트 생성 완료 대기 (1-2분)

---

### **Step 2: API 키 복사**

1. **Settings** → **API** 메뉴로 이동
2. 다음 정보 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 공개하지 말 것!)

```bash
# .env.local 파일에 입력하는 예
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Step 3: 데이터베이스 스키마 생성**

1. Supabase Dashboard에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭
3. `supabase-setup.sql` 파일의 전체 내용 복사
4. SQL 에디터에 붙여넣기
5. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)

```sql
-- 이 쿼리가 성공하면 모든 테이블과 정책이 생성됩니다
```

**결과 확인:**
- Table Editor 좌측에 6개 테이블 표시: USERS, SCHEDULE_TYPES, SCHEDULES, SONGS, SETLISTS, SONG_STATS

---

### **Step 4: 스토리지 버킷 생성 (선택)**

이미지 업로드 기능을 사용하려면:

1. **Storage** 메뉴 클릭
2. **Create a new bucket**
   - Name: `posters`
   - Privacy: `Public`
3. **Create bucket** 클릭

4. 또 다른 버킷 생성:
   - Name: `album-art`
   - Privacy: `Public`

---

### **Step 5: 인증 설정**

1. **Authentication** 메뉴 클릭
2. **Providers** 탭에서 이메일 활성화 확인
3. **Settings** 탭:
   - Site URL: `http://localhost:3000` (로컬)
   - 배포 후: `https://your-domain.netlify.app`

---

### **Step 6: 테스트 데이터 입력 (선택)**

#### A. 샘플 곡 추가

```sql
INSERT INTO SONGS (title, album, artist) VALUES
  ('그대의 손', 'Single', 'Touched'),
  ('밤새도록', 'Album 1', 'Touched'),
  ('별이 되어', 'Album 1', 'Touched'),
  ('시작', 'Album 2', 'Touched'),
  ('끝', 'Album 2', 'Touched'),
  ('봄날', 'Single', 'Touched'),
  ('여름의 꿈', 'Album 3', 'Touched'),
  ('가을 하늘', 'Album 3', 'Touched'),
  ('겨울 이야기', 'Album 3', 'Touched'),
  ('추억', 'Album 4', 'Touched')
ON CONFLICT DO NOTHING;
```

#### B. 샘플 공연 추가

```sql
INSERT INTO SCHEDULES (title, performanceDate, venue, city, schedule_type_id, description) VALUES
  ('2024 Single Album Release Concert', '2024-03-15', 'Jangchung Arena', 'Seoul', 1, '신앨범 발표 콘서트'),
  ('Touched Spring Festival 2024', '2024-04-20', 'Olympic Gymnastics Arena', 'Seoul', 2, '봄 페스티벌 특별 무대'),
  ('Music Show Recording', '2024-05-10', 'MBC Studio', 'Seoul', 3, '음악 프로그램 녹화'),
  ('Summer Open Air Concert', '2024-08-01', 'Seoul Plaza', 'Seoul', 1, '여름 야외 공연'),
  ('Autumn Concert Tour - Seoul', '2024-10-12', 'Blue Square', 'Seoul', 1, '가을 투어');
```

#### C. 세트리스트 추가 (선택사항)

더 등록하려면 곡의 UUID와 공연의 UUID가 필요합니다.
1. Table Editor에서 SONGS 테이블의 id 열 복사
2. Table Editor에서 SCHEDULES 테이블의 id 열 복사
3. 아래와 같이 실행:

```sql
-- 첫 번째 공연 세트리스트
INSERT INTO SETLISTS (schedule_id, song_id, order) VALUES
  ('[SCHEDULE_ID_1]', '[SONG_ID_1]', 1),
  ('[SCHEDULE_ID_1]', '[SONG_ID_2]', 2),
  ('[SCHEDULE_ID_1]', '[SONG_ID_3]', 3);
```

---

## ⚙️ .env.local 설정

프로젝트 루트에서 `.env.local` 파일에 아래 내용 입력:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 배포 환경
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

---

## ✅ 설정 완료 확인

### 터미널에서:

```bash
# 프로젝트 디렉토리로 이동
cd d:/작업/mix/touched-setlist

# 의존성 설치 (처음만)
npm install

# 데이터 베이스 연결 테스트
npm run dev
```

### 브라우저에서:

1. **http://localhost:3000** 접속
2. 홈 페이지 로드 시:
   - 달력이 표시되면 ✅ 성공
   - 에러 발생 시:
     - 콘솔 확인 (F12)
     - `.env.local` 확인
     - Supabase RLS 정책 확인

---

## 🔍 유용한 SQL 명령어

### 모든 공연 조회:
```sql
SELECT * FROM SCHEDULES ORDER BY performanceDate DESC;
```

### 모든 곡 조회:
```sql
SELECT * FROM SONGS ORDER BY title;
```

### 특정 공연의 세트리스트:
```sql
SELECT s.title, sl.order 
FROM SETLISTS sl 
JOIN SONGS s ON sl.song_id = s.id 
WHERE sl.schedule_id = '[SCHEDULE_ID]'
ORDER BY sl.order;
```

### 통계 조회:
```sql
SELECT year, playCount, SUM(playCount) OVER (PARTITION BY year) as total
FROM SONG_STATS 
ORDER BY year DESC, playCount DESC;
```

### 테이블 초기화 (개발용):
```sql
-- ⚠️ 주의: 모든 데이터 삭제
TRUNCATE TABLE SETLISTS CASCADE;
TRUNCATE TABLE SONGS CASCADE;
TRUNCATE TABLE SCHEDULES CASCADE;
TRUNCATE TABLE SONG_STATS CASCADE;
```

---

## 🚨 문제 해결

### 문제: "Failed to fetch from Supabase"

**원인:** 환경 변수 오류
- `.env.local` 파일 확인
- API 키가 정확하게 복사되었는지 확인
- 파일을 저장하고 개발 서버 재시작

### 문제: "RLS policy violation"

**원인:** 관리자 권한 없음
- 공개 읽기는 되지만 수정/삭제는 관리자만 가능
- 나중에 관리자 계정 생성 필요

### 문제: 테이블이 보이지 않음

**원인:** SQL 실행 실패
- Supabase SQL Editor에서 에러 메시지 확인
- 전체 `supabase-setup.sql` 다시 실행

---

## 📊 데이터베이스 다이어그램

```
USERS
├── id (UUID, PK)
├── email (VARCHAR)
├── is_admin (BOOLEAN)
└── created_at

SCHEDULE_TYPES
├── id (SERIAL, PK)
├── type_name (VARCHAR)
└── icon (VARCHAR)

SCHEDULES
├── id (UUID, PK)
├── title (VARCHAR)
├── performanceDate (DATE)
├── venue (VARCHAR)
├── city (VARCHAR)
├── schedule_type_id (FK)
├── posterUrl (VARCHAR)
├── created_by (FK)
└── created_at

SONGS
├── id (UUID, PK)
├── title (VARCHAR)
├── album (VARCHAR)
├── albumArtUrl (VARCHAR)
├── spotifyUrl (VARCHAR)
├── appleMusicUrl (VARCHAR)
├── melonUrl (VARCHAR)
├── genieUrl (VARCHAR)
└── created_at

SETLISTS
├── id (UUID, PK)
├── schedule_id (FK)
├── song_id (FK)
├── order (INTEGER)
└── notes (TEXT)

SONG_STATS
├── song_id (FK)
├── year (INTEGER)
├── playCount (INTEGER)
└── updated_at
```

---

## 🎉 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 데이터베이스 스키마 설정
3. ⏭️ 테스트 데이터 입력
4. ⏭️ 관리자 인증 구현
5. ⏭️ Netlify 배포

**질문이 있으면 언제든지 물어보세요!** 🚀
