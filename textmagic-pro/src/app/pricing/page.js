'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '하루 5회 사용',
      '모든 AI 도구 접근',
      '기본 처리 속도',
      '커뮤니티 지원'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    featured: true,
    features: [
      '하루 500회 사용',
      '모든 AI 도구 접근',
      '우선 처리 속도',
      '이메일 지원',
      '사용량 분석'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 29,
    features: [
      '하루 2000회 사용',
      '모든 AI 도구 접근',
      'API 접근',
      '팀 기능 (최대 5명)',
      '우선 지원',
      '맞춤 통합'
    ]
  }
];

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Paddle 초기화
  useEffect(() => {
    if (paddleLoaded && window.Paddle) {
      const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';

      if (clientToken) {
        window.Paddle.Environment.set(environment);
        window.Paddle.Initialize({
          token: clientToken
        });
        console.log('Paddle initialized');
      }
    }
  }, [paddleLoaded]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    if (!user) {
      router.push('/register');
      return;
    }

    if (planId === 'free') {
      router.push('/dashboard');
      return;
    }

    // Paddle Price IDs (환경변수에서 가져옴)
    const priceIds = {
      pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
      business: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID
    };

    const priceId = priceIds[planId];

    if (!priceId || !window.Paddle) {
      alert('결제 설정이 완료되지 않았습니다. 관리자에게 문의하세요.');
      return;
    }

    setProcessingPlan(planId);

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user.email
        },
        customData: {
          user_email: user.email,
          user_id: user.id.toString()
        },
        settings: {
          successUrl: `${window.location.origin}/dashboard?success=true`,
          displayMode: 'overlay',
          theme: 'light',
          locale: 'ko'
        }
      });
    } catch (error) {
      console.error('Paddle checkout error:', error);
      alert('결제 창을 열 수 없습니다. 다시 시도해주세요.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <>
      {/* Paddle.js 로드 */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={() => setPaddleLoaded(true)}
      />

      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            ✨ TextMagic Pro
          </Link>
          <nav className="nav">
            {loading ? null : user ? (
              <>
                <Link href="/dashboard" className="nav-link">대시보드</Link>
                <span className={`plan-badge ${user.plan}`}>{user.plan}</span>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">로그인</Link>
                <Link href="/register" className="btn btn-primary">무료 시작</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="pricing-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>심플한 가격 정책</h1>
            <p style={{ color: 'var(--gray-500)', maxWidth: '500px', margin: '0 auto' }}>
              필요에 맞는 플랜을 선택하세요. 언제든지 업그레이드하거나 취소할 수 있습니다.
            </p>
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`card pricing-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="pricing-badge">가장 인기</div>}
                <h3>{plan.name}</h3>
                <div className="pricing-price">
                  ${plan.price}<span>/월</span>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button
                  className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={processingPlan === plan.id || (user && user.plan === plan.id)}
                  style={{ width: '100%' }}
                >
                  {processingPlan === plan.id ? (
                    '처리 중...'
                  ) : user && user.plan === plan.id ? (
                    '현재 플랜'
                  ) : plan.id === 'free' ? (
                    '무료로 시작'
                  ) : (
                    '업그레이드'
                  )}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--gray-500)' }}>
            <p>💳 안전한 결제 (Paddle) | 📧 7일 환불 보장 | 🌍 전 세계 결제 지원</p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div>© 2025 TextMagic Pro. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="mailto:support@textmagic.pro">지원</a>
          </div>
        </div>
      </footer>
    </>
  );
}
