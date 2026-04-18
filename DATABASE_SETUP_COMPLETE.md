# 📋 Touched Setlist Archive - 데이터베이스 셋업 완료 요약

## ✅ 생성된 파일 목록

### 데이터베이스 관련 파일
| 파일 | 용도 |
|------|------|
| `supabase-setup.sql` | 📊 전체 데이터베이스 스키마 및 RLS 정책 |
| `supabase-sample-data.sql` | 🎬 샘플 공연, 곡, 세트리스트 데이터 |
| `SUPABASE_SETUP.md` | 📘 상세 설정 가이드 |
| `QUICK_START.md` | ⚡ 5분 빠른 시작 가이드 |
| `start-dev.sh` | 🚀 개발 서버 시작 스크립트 |

---

## 🗄️ 데이터베이스 스키마 요약

### 생성된 테이블 (6개)

```
1. USERS
   - 관리자 계정 관리
   - 공연 생성자 추적

2. SCHEDULE_TYPES
   - 공연 유형: 단독콘서트, 페스티벌, 방송 등
   - 각 유형별 아이콘

3. SCHEDULES
   - 공연 기본 정보
   - 날짜, 장소, 포스터 URL
   - 공연 타입, 설명, 비고

4. SONGS
   - 곡 마스터 데이터
   - 앨범, 스트리밍 링크

5. SETLISTS
   - 각 공연의 곡 순서
   - SCHEDULES ↔ SONGS 연결

6. SONG_STATS
   - 연도별 연주 횟수 집계
   - 통계 계산 최적화
```

### 생성된 기능

#### Row Level Security (RLS)
- ✅ 공개 읽기: 모든 사용자 공연/곡 조회 가능
- ✅ 관리자 쓰기: 관리자만 데이터 수정/삭제 가능

#### 자동 계산 함수
- ✅ `update_song_stats()`: 세트리스트 변경 시 통계 자동 업데이트
- ✅ Trigger: INSERT/DELETE 시 트리거

#### 뷰 (View)
- ✅ `view_performance_details`: 공연 상세 정보
- ✅ `view_top10_songs`: TOP 10 곡 통계

---

## 📊 샘플 데이터

### 공연 타입 (자동 추가)
- 🎤 단독 콘서트
- 🎪 페스티벌
- 📺 방송 녹화
- ⭐ 특별 공연
- 💻 온라인 공연
- 🤝 콜라보레이션

### 샘플 곡 (12곡)
```
1. 그대의 손
2. 밤새도록
3. 별이 되어
4. 시작
5. 끝
6. 봄날
7. 여름의 꿈
8. 가을 하늘
9. 겨울 이야기
10. 추억
11. 오늘
12. 내일
```

### 샘플 공연 (8개)
```
1. 2024 Single Album Release Concert (03-15)
2. Touched Spring Festival 2024 (04-20)
3. Music Show Recording - MBC (05-10)
4. Summer Open Air Concert (08-01)
5. Autumn Concert Tour - Seoul (10-12)
6. Winter Special Live Concert (12-25)
7. 2025 New Year Live (01-01)
8. Online Concert - Vlive (02-14)
```

---

## 🎯 다음 단계 (체크리스트)

### Phase 1: 로컬 개발 환경 설정
- [ ] Node.js 18+ 설치 확인
- [ ] Supabase 계정 생성
- [ ] Supabase 프로젝트 생성 (`touched-setlist`)
- [ ] API 키 복사
- [ ] `supabase-setup.sql` 실행 (데이터베이스 스키마 생성)
- [ ] `supabase-sample-data.sql` 실행 (샘플 데이터 추가)
- [ ] `.env.local` 파일 생성 및 API 키 입력
- [ ] `npm install` 실행
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 접속 확인

### Phase 2: 기능 테스트
- [ ] 홈 페이지 달력 로드 확인
- [ ] 공연 포스터 클릭 → 상세 페이지 이동
- [ ] 곡 클릭 → 팝업 모달 표시
- [ ] 통계 페이지 차트 표시
- [ ] 관리자 페이지 접속 (로그인 기능은 아직 미구현)

### Phase 3: 관리자 기능 구현
- [ ] Supabase Auth 인증 구현
- [ ] 관리자 로그인 페이지 완성
- [ ] 공연 등록 기능 구현
- [ ] 곡 관리 기능 구현
- [ ] 세트리스트 입력 기능 구현 (신곡 자동 추가)

### Phase 4: 배포 준비
- [ ] 이미지 최적화 (Cloudinary/Supabase Storage)
- [ ] 에러 핸들링 및 로깅
- [ ] 성능 최적화 (ISG 캐싱 확인)
- [ ] 선택적: 다크 모드, PWA 지원

### Phase 5: Netlify 배포
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Netlify 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 자동 배포 설정
- [ ] 프로덕션 URL 확인

---

## 📁 파일 구조

```
touched-setlist/
├── 📋 문서
│   ├── README.md
│   ├── QUICK_START.md ← 여기서 시작!
│   ├── SUPABASE_SETUP.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── supabase-setup.sql
│   ├── supabase-sample-data.sql
│   └── start-dev.sh
│
├── 🔧 설정
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── netlify.toml
│   ├── .env.local ← 만들어야 함
│   ├── .env.example
│   └── .gitignore
│
├── 📦 소스 코드
│   └── src/
│       ├── app/ (페이지 + API)
│       ├── components/ (재사용 컴포넌트)
│       ├── lib/ (유틸리티)
│       └── types/ (TypeScript 타입)
│
└── 📄 기타
    └── public/ (정적 파일)
```

---

## 🚀 바로 시작하기

### 1️⃣ Supabase 설정 (5분)

```bash
# 1. https://supabase.com 가입
# 2. 새 프로젝트 생성: "touched-setlist"
# 3. API 키 복사
# 4. SQL Editor에서 supabase-setup.sql 실행
# 5. SQL Editor에서 supabase-sample-data.sql의 Step 1, 2 실행
```

### 2️⃣ 로컬 환경 설정 (2분)

```bash
# 프로젝트 디렉토리에서
cd d:/작업/mix/touched-setlist

# .env.local 생성 (API 키 입력)
# 아래 내용을 포함:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NODE_ENV=development

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 3️⃣ 확인 (1분)

```bash
# 브라우저에서 열기
http://localhost:3000

# 확인 사항:
# ✅ 달력 페이지 로드
# ✅ 공연 포스터 표시
# ✅ 통계 페이지 접속 가능
```

---

## 📖 가이드 읽기 순서

1. **이 파일** ← 지금 읽는 중 (개요)
2. **QUICK_START.md** ← 5분 안에 시작
3. **SUPABASE_SETUP.md** ← 상세 설정 가이드
4. **README.md** ← 전체 프로젝트 문서
5. **IMPLEMENTATION_GUIDE.md** ← 다음 단계

---

## 🆘 빠른 도움말

| 문제 | 해결 |
|------|------|
| `Failed to fetch` | `.env.local` 확인, 개발 서버 재시작 |
| 테이블이 없음 | `supabase-setup.sql` 다시 실행 |
| 달력에 공연 없음 | `supabase-sample-data.sql` Step 1, 2 실행 |
| 환경 변수 인식 안 됨 | 파일명 `.env.local` 확인, 서버 재시작 |
| 타입 에러 | `npm run type-check` 실행 |

---

## ✨ 완료!

축하합니다! 📊 데이터베이스 셋업이 완료되었습니다.

**이제:**
1. 위의 "바로 시작하기" 따라 실행
2. 또는 `QUICK_START.md` 읽기
3. 문제 발생 시 이 파일의 "빠른 도움말"에서 확인

**언제든지 질문 환영합니다!** 🚀
