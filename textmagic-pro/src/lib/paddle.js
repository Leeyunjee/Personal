// Paddle Configuration
// Paddle은 클라이언트 사이드에서 체크아웃을 처리합니다

export const PADDLE_CONFIG = {
  vendorId: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pri_pro_monthly',
    features: [
      '하루 500회 사용',
      '모든 AI 도구 접근',
      '우선 처리',
      '이메일 지원'
    ]
  },
  business: {
    name: 'Business',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID || 'pri_business_monthly',
    features: [
      '하루 2000회 사용',
      '모든 AI 도구 접근',
      'API 접근',
      '팀 기능 (최대 5명)',
      '우선 지원',
      '맞춤 통합'
    ]
  }
};

// Webhook 서명 검증 (서버 사이드)
export function verifyPaddleWebhook(rawBody, signature) {
  const crypto = require('crypto');
  const publicKey = process.env.PADDLE_WEBHOOK_SECRET;

  if (!publicKey) {
    console.warn('Paddle webhook secret not configured');
    return true; // 개발 환경에서는 통과
  }

  try {
    // Paddle 서명 검증 로직
    const hmac = crypto.createHmac('sha256', publicKey);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return false;
  }
}
