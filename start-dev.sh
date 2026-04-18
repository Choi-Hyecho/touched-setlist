#!/bin/bash
# ============================================
# Touched Setlist - 로컬 개발 셋업 스크립트
# ============================================

set -e

echo "🎵 Touched Setlist Archive - 개발 환경 셋업"
echo "============================================"

# Node.js 버전 확인
echo "📦 Node.js 버전 확인..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "📥 https://nodejs.org/ 에서 설치해주세요"
    exit 1
fi

echo "✅ Node.js $(node --version) 확인됨"
echo "✅ npm $(npm --version) 확인됨"

# 의존성 설치
echo ""
echo "📥 npm 의존성 설치 중..."
npm install

# .env.local 파일 확인
echo ""
echo "🔐 환경 변수 설정 확인..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local 파일이 없습니다"
    echo "📋 .env.example를 참고하여 .env.local을 생성해주세요"
    echo ""
    echo "필수 환경 변수:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# 환경 변수 파일 검증
if grep -q "your_supabase_url_here" .env.local; then
    echo "❌ .env.local에 실제 값을 입력해주세요"
    exit 1
fi

echo "✅ .env.local 설정 완료"

# 개발 서버 시작
echo ""
echo "🚀 개발 서버 시작 중..."
echo "📍 http://localhost:3000"
echo ""
echo "💡 팁: 대문자 C를 누르면 서버를 중지할 수 있습니다"
echo "============================================"
echo ""

npm run dev
