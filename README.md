# 🎵 Touched Setlist Archive

터치드(Touched) 아티스트의 공연 기록을 아카이빙하는 현대적인 웹 서비스입니다.

## ✨ 주요 기능

### 📅 달력 메뉴
- 월 단위 달력 형식으로 공연 포스터 조회
- 공연 성격별 필터링 (단독 콘서트, 페스티벌, 방송 등)
- 공연명으로 검색

### 📄 공연 상세 페이지
- 공연 정보 (날짜, 장소, 설명)
- 해당 공연의 세트리스트 목록 표시
- 곡명 클릭 시 팝업으로 앨범 커버 이미지 및 스트리밍 링크 제공
  - Apple Music
  - Spotify
  - Melon
  - Genie

### 📊 통계 메뉴
- 올해 가장 많이 연주된 곡 TOP 10
- 연도별 공연 횟수
- 월별 공연 분석
- 상세 통계 테이블

### 🔐 관리자 패널
- 공연 스케줄 등록
- 곡 마스터 데이터 관리
- 세트리스트 입력 (신곡 자동 추가)

### 🎤 공통 기능
- 아티스트 공식 채널 링크 (YouTube, Instagram, X)
- 팬 메이드 사이트 안내
- 문의 및 오류 제보 경로 안내

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React icons
- **Visualization**: Recharts
- **Date**: date-fns

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage / Cloudinary

### Deployment
- **Hosting**: Netlify
- **CDN**: Netlify Edge Functions

## 🚀 시작하기

### 사전 준비

1. [Supabase](https://supabase.com) 계정 생성
2. Node.js 18+ 설치
3. Git 설치

### 1. 저장소 클론 및 의존성 설치

```bash
cd touched-setlist
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 만들고 아래 정보를 입력하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 배포 환경
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Supabase 데이터베이스 설정

Supabase SQL Editor에서 아래 스크립트를 실행하세요:

```sql
-- USERS 테이블
CREATE TABLE USERS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCHEDULE_TYPES 테이블
CREATE TABLE SCHEDULE_TYPES (
  id SERIAL PRIMARY KEY,
  type_name VARCHAR(100) NOT NULL,
  icon VARCHAR(50)
);

-- SCHEDULES 테이블
CREATE TABLE SCHEDULES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  performanceDate DATE NOT NULL UNIQUE,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  schedule_type_id INTEGER REFERENCES SCHEDULE_TYPES(id),
  posterUrl VARCHAR(500),
  remarks TEXT,
  created_by UUID REFERENCES USERS(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SONGS 테이블
CREATE TABLE SONGS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL UNIQUE,
  artist VARCHAR(100) DEFAULT 'Touched',
  album VARCHAR(100),
  albumArtUrl VARCHAR(500),
  spotifyUrl VARCHAR(500),
  appleMusicUrl VARCHAR(500),
  melonUrl VARCHAR(500),
  genieUrl VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SETLISTS 테이블
CREATE TABLE SETLISTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES SCHEDULES(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES SONGS(id),
  order INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SONG_STATS 테이블
CREATE TABLE SONG_STATS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES SONGS(id),
  year INTEGER NOT NULL,
  playCount INTEGER DEFAULT 0,
  totalPerformances INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(song_id, year)
);

-- 샘플 데이터 (공연 타입)
INSERT INTO SCHEDULE_TYPES (type_name, icon) VALUES
  ('단독 콘서트', '🎤'),
  ('페스티벌', '🎪'),
  ('방송 녹화', '📺'),
  ('특별 공연', '⭐'),
  ('온라인 공연', '💻');
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 📁 프로젝트 구조

```
touched-setlist/
├── src/
│   ├── app/                    # Next.js 앱 디렉토리
│   │   ├── page.tsx            # 홈 (달력)
│   │   ├── performance/[id]/   # 공연 상세
│   │   ├── stats/              # 통계
│   │   ├── admin/              # 관리자 페이지
│   │   ├── api/                # API 라우트
│   │   ├── layout.tsx          # 레이아웃
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # React 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Calendar.tsx
│   │   ├── SongModal.tsx
│   │   └── StatChart.tsx
│   ├── lib/                    # 유틸리티 및 설정
│   │   └── supabase.ts
│   └── types/                  # TypeScript 타입
│       └── database.types.ts
├── public/                     # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── netlify.toml               # Netlify 배포 설정
```

## 🚀 배포

### Netlify로 배포

1. GitHub에 저장소 푸시
2. [Netlify](https://netlify.com)에서 "New site from Git" 선택
3. GitHub 저장소 연결
4. 환경 변수 설정
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
5. Deploy 버튼 클릭

### 자동 배포 설정

GitHub에 푸시하면 자동으로 Netlify에서 배포됩니다.

## 🔒 보안

- Supabase Row Level Security (RLS) 정책 설정
- 관리자만 공연/곡 정보 수정 가능
- 모든 민감한 정보는 서버 사이드에서 처리

## 📊 성능 최적화

- **ISG (Incremental Static Generation)**: 달력, 공연 상세, 통계 페이지 캐싱
- **이미지 최적화**: Next.js Image 컴포넌트 사용, WebP/AVIF 변환
- **Lazy Loading**: 이미지 lazy loading으로 초기 로드 시간 단축
- **CDN 캐싱**: Netlify 엣지 캐싱 설정

## 🐛 알려진 문제 & 개선 사항

- [ ] 관리자 인증 이메일 검증
- [ ] 공연 포스터 이미지 업로드 기능
- [ ] 곡 통계 실시간 계산
- [ ] 이전 공연/향후 공연 추천
- [ ] 공연 일정 캘린더 알림

## 📝 라이선스

이 프로젝트는 팬 메이드 사이트입니다. 터치드의 모든 음악과 이미지의 저작권은 터치드에게 있습니다.

## 📧 문의

오류 제보나 문의사항은 다음 채널로 연락주세요:
- Instagram: [@touched_official](https://instagram.com/touched_official)
- X: [@touched_official](https://x.com/touched_official)

---

**Made with ❤️ for Touched fans**
