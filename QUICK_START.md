# ⚡ 빠른 시작 가이드 (Quick Start)

5분 안에 로컬 개발 환경을 시작하는 가이드입니다.

## 📋 체크리스트

- [ ] Node.js 18+ 설치
- [ ] Supabase 계정 생성
- [ ] 데이터베이스 스키마 생성
- [ ] 환경 변수 설정
- [ ] 개발 서버 시작

---

## 🚀 0단계: 사전 준비

```bash
# Node.js 버전 확인
node --version    # v18.0.0 이상 필요
npm --version     # npm 9.0.0 이상 필요
```

---

## 1️⃣ Supabase 프로젝트 생성 (5분)

### 1.1 Supabase 프로젝트 만들기

1. https://supabase.com 접속
2. **Sign in** 또는 **Sign up**
3. **New Project** 클릭
   - **Project Name:** `touched-setlist`
   - **Database Password:** (복잡한 비밀번호 입력) ⚠️
   - **Region:** Asia Southeast-Singapore (또는 가장 가까운 지역)
   - **Pricing:** Free
4. **Create new project** 클릭

프로젝트 생성 완료 대기 (1-2분)

### 1.2 API 키 복사

1. Supabase Dashboard 우측 하단 **Settings** 클릭
2. **API** 메뉴로 이동
3. 아래 3개 복사:
   ```
   Project URL → NEXT_PUBLIC_SUPABASE_URL
   anon (public) → NEXT_PUBLIC_SUPABASE_ANON_KEY
   service_role (secret) → SUPABASE_SERVICE_ROLE_KEY ⚠️
   ```

---

## 2️⃣ 데이터베이스 스키마 생성 (2분)

### 2.1 SQL 스크립트 실행

1. Supabase Dashboard → **SQL Editor**
2. **New Query** 클릭
3. `supabase-setup.sql` 파일 전체 내용 복사
4. 에디터에 붙여넣기
5. **Run** 버튼 (또는 `Ctrl + Enter`)

✅ 완료! 6개 테이블이 자동생성됩니다.

### 2.2 샘플 데이터 추가

1. 같은 방식으로 **New Query**
2. `supabase-sample-data.sql` 의 **Step 1**과 **Step 2** 섹션 실행:
   ```sql
   -- Step 1: 샘플 곡 추가
   INSERT INTO SONGS ...
   
   -- Step 2: 샘플 공연 추가
   INSERT INTO SCHEDULES ...
   ```

✅ 샘플 데이터 12곡 + 8개 공연 추가됨

---

## 3️⃣ 환경 변수 설정 (1분)

### 3.1 .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일 생성 (또는 기존 파일 수정):

```bash
# Supabase API 설정
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 배포 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ **주의:** `.env.local`은 .gitignore에 포함되어 있어 자동으로 무시됩니다. 절대 공개하지 마세요!

---

## 4️⃣ 개발 서버 시작 (1분)

### 4.1 의존성 설치

```bash
npm install
```

### 4.2 개발 서버 실행

```bash
npm run dev
```

### 4.3 브라우저에서 확인

http://localhost:3000 접속

✅ **성공 표시:**
- 🗓️ 달력 페이지 로드
- 📅 샘플 공연이 달력에 표시됨
- 📊 통계 페이지 접속 가능

---

## 🔍 테스트하기

### 홈 페이지 테스트 ✅

```
1. http://localhost:3000 접속
2. 달력 표시 확인
3. 공연 찾기:
   - 4월: "Touched Spring Festival 2024" (벚꽃 아이콘 🎪)
   - 5월: "Music Show Recording - MBC" (TV 아이콘 📺)
```

### 공연 상세 페이지 테스트 ✅

```
1. 달력에서 공연 포스터 클릭
2. 공연 정보 표시 확인:
   - 공연명
   - 날짜 & 시간
   - 장소
   - 세트리스트 목록
```

### 곡 정보 팝업 테스트 ✅

```
1. 공연 상세 페이지에서 곡명 클릭
2. 팝업 표시 확인:
   - 앨범 아트
   - 곡명, 앨범명
   - 스트리밍 링크 버튼
```

### 통계 페이지 테스트 ✅

```
1. http://localhost:3000/stats 접속
2. 차트와 통계 표시 확인
3. 연도 선택 변경 가능 확인
```

---

## 🆘 문제 해결

### "Failed to fetch" 또는 CORS 에러

**해결:**
```bash
# 1. .env.local 확인
# NEXT_PUBLIC_SUPABASE_URL 등이 정확한지 확인

# 2. 개발 서버 재시작
npm run dev

# 3. 브라우저 캐시 삭제
Ctrl + Shift + Delete (또는 Cmd + Shift + Delete on Mac)
```

### 환경 변수 인식 안 됨

**해결:**
```bash
# 1. 파일명 확인: .env.local (정확히 이 이름)
# 2. 파일 위치: 프로젝트 루트
# 3. 개발 서버 종료 후 재시작: npm run dev
```

### 테이블이 보이지 않음

**확인:**
1. Supabase Dashboard → Table Editor
2. 좌측에 6개 테이블 확인:
   - USERS
   - SCHEDULE_TYPES ✅ (6개 샘플 데이터)
   - SCHEDULES ✅ (8개 샘플 데이터)
   - SONGS ✅ (12개 샘플 데이터)
   - SETLISTS
   - SONG_STATS

테이블이 없으면 `supabase-setup.sql` 다시 실행

### 달력에 공연이 표시 안 됨

**확인:**
1. Supabase Dashboard → SQL Editor
2. 아래 쿼리 실행:
   ```sql
   SELECT COUNT(*) FROM SCHEDULES;
   SELECT * FROM SCHEDULES LIMIT 1;
   ```
3. 데이터가 있으면 캐시 문제 → 브라우저 새로고침 (F5)

---

## 📚 다음 단계

### 개발 시작

1. **관리자 기능 테스트**
   - `/admin` 페이지 확인
   - 관리자 로그인 기능 구현 예정

2. **공연/곡 추가**
   - Supabase Table Editor에서 직접 추가
   - 또는 나중에 관리자 페이지에서 추가

3. **이미지 업로드 (선택)**
   - Supabase Storage 버킷 생성
   - 공연 포스터 URL 입력

### 배포 준비

- `/admin` 페이지 인증 구현
- 이미지 업로드 기능 완성
- Netlify 환경 변수 설정
- 프로덕션 배포

---

## 💡 유용한 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 프로젝트 실행
npm start

# 타입 검사
npm run type-check

# 코드 린팅
npm run lint
```

---

## 📖 상세 문서

- **데이터베이스:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **전체 가이드:** [README.md](./README.md)
- **구현 가이드:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

---

## ✅ 완료!

축하합니다! 이제 로컬 개발 환경이 완성되었습니다. 🎉

**다음 목표:**
- [ ] 관리자 페이지 인증 구현
- [ ] 공연 등록 기능 완성
- [ ] Netlify 배포
- [ ] 공식 운영 시작

---

**문제가 있으면 언제든지 물어보세요!** 💬
