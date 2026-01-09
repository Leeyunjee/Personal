#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✨ TextMagic Pro - 서비스 시작                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');
const dataDir = path.join(projectRoot, 'data');

// 환경 설정 확인
if (!fs.existsSync(envPath)) {
  console.log('⚠️  환경 설정 파일이 없습니다. 기본 설정을 생성합니다...\n');

  const crypto = require('crypto');
  const jwtSecret = crypto.randomBytes(32).toString('hex');

  const defaultEnv = `JWT_SECRET=${jwtSecret}
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ 기본 환경 설정 파일 생성 완료\n');
  console.log('ℹ️  OpenAI API 키를 추가하려면 .env.local 파일을 수정하세요.\n');
}

// 데이터 디렉토리 확인
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 데이터 디렉토리 생성 완료\n');
}

// 의존성 확인
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 의존성 패키지 설치 중...\n');
  try {
    execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
    console.log('\n✅ 의존성 설치 완료\n');
  } catch (error) {
    console.error('❌ 의존성 설치 실패:', error.message);
    process.exit(1);
  }
}

console.log('🚀 개발 서버 시작 중...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Next.js 개발 서버 시작
const server = spawn('npm', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ 서버 시작 실패:', error.message);
});

// 종료 핸들링
process.on('SIGINT', () => {
  console.log('\n\n👋 서버를 종료합니다...');
  server.kill();
  process.exit(0);
});

// 시작 메시지
setTimeout(() => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 서버가 시작되었습니다!

🌐 브라우저에서 열기: http://localhost:3000

💡 빠른 시작:
   1. 회원가입 (이메일, 비밀번호)
   2. 로그인
   3. AI 도구 사용!

💰 수익화 설정:
   - OpenAI API 키 추가: .env.local 파일 수정
   - Stripe 결제 연동: https://dashboard.stripe.com

Ctrl+C 로 종료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}, 3000);
