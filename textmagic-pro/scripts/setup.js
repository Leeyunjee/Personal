#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✨ TextMagic Pro - 초기 설정 마법사                          ║
║                                                                ║
║   AI 텍스트 도구로 월 $400 수익 창출 시작하기                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

async function setup() {
  try {
    // 1. 데이터 디렉토리 생성
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ 데이터 디렉토리 생성 완료');
    }

    // 2. 환경 변수 설정
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = '';

    console.log('\n📋 환경 설정을 시작합니다...\n');

    // JWT Secret 자동 생성
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    envContent += `JWT_SECRET=${jwtSecret}\n`;
    console.log('✅ JWT 시크릿 자동 생성 완료');

    // OpenAI API Key
    console.log('\n🔑 OpenAI API 키 설정');
    console.log('   (선택사항 - 없으면 데모 모드로 실행됩니다)');
    console.log('   API 키 발급: https://platform.openai.com/api-keys');
    const openaiKey = await question('   OpenAI API Key (Enter로 건너뛰기): ');

    if (openaiKey.trim()) {
      envContent += `OPENAI_API_KEY=${openaiKey.trim()}\n`;
      console.log('✅ OpenAI API 키 설정 완료');
    } else {
      envContent += `OPENAI_API_KEY=\n`;
      console.log('ℹ️  데모 모드로 실행됩니다 (나중에 추가 가능)');
    }

    // Stripe 설정
    console.log('\n💳 Stripe 결제 설정');
    console.log('   (선택사항 - 실제 결제 수익을 원하면 설정하세요)');
    console.log('   API 키 발급: https://dashboard.stripe.com/apikeys');
    const stripeKey = await question('   Stripe Secret Key (Enter로 건너뛰기): ');

    if (stripeKey.trim()) {
      envContent += `STRIPE_SECRET_KEY=${stripeKey.trim()}\n`;

      const stripePubKey = await question('   Stripe Publishable Key: ');
      envContent += `STRIPE_PUBLISHABLE_KEY=${stripePubKey.trim()}\n`;

      console.log('✅ Stripe 키 설정 완료');
      console.log('\n   ⚠️  Stripe 가격 ID는 나중에 Stripe Dashboard에서');
      console.log('      제품을 만든 후 .env.local 파일에 추가하세요.');
    } else {
      envContent += `STRIPE_SECRET_KEY=\n`;
      envContent += `STRIPE_PUBLISHABLE_KEY=\n`;
      console.log('ℹ️  결제 기능 없이 실행됩니다');
    }

    // URL 설정
    envContent += `\nNEXT_PUBLIC_URL=http://localhost:3000\n`;

    // 파일 저장
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ 환경 설정 파일 저장 완료 (.env.local)');

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎉 설정 완료!                                                ║
║                                                                ║
║   다음 명령어로 서비스를 시작하세요:                            ║
║                                                                ║
║   npm run dev                                                  ║
║                                                                ║
║   또는                                                         ║
║                                                                ║
║   npm run launch   (자동 빌드 & 실행)                          ║
║                                                                ║
║   브라우저에서 http://localhost:3000 을 열어 확인하세요!         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

  } catch (error) {
    console.error('❌ 설정 중 오류 발생:', error.message);
  } finally {
    rl.close();
  }
}

setup();
