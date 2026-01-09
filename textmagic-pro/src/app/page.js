'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TOOLS = [
  { id: 'summarize', name: '텍스트 요약', description: '긴 텍스트를 간결하게 요약합니다', icon: '📝' },
  { id: 'grammar', name: '문법 검사', description: '영문 문법을 검사하고 교정합니다', icon: '✓' },
  { id: 'email', name: '이메일 작성', description: '전문적인 비즈니스 이메일을 작성합니다', icon: '✉️' },
  { id: 'social', name: '소셜 미디어', description: 'SNS용 매력적인 포스트를 생성합니다', icon: '📱' },
  { id: 'seo', name: 'SEO 메타 태그', description: '검색 최적화된 메타 태그를 생성합니다', icon: '🔍' },
  { id: 'headline', name: '제목 생성', description: '클릭을 유도하는 제목을 생성합니다', icon: '🎯' },
  { id: 'translate', name: '번역', description: '다국어 번역을 제공합니다', icon: '🌐' },
  { id: 'rewrite', name: '리라이터', description: '기존 콘텐츠를 새롭게 재작성합니다', icon: '🔄' },
  { id: 'expand', name: '텍스트 확장', description: '짧은 아이디어를 자세히 확장합니다', icon: '📈' },
  { id: 'simplify', name: '간단하게 설명', description: '복잡한 내용을 쉽게 설명합니다', icon: '💡' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

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

  const handleToolClick = (toolId) => {
    if (user) {
      router.push(`/dashboard?tool=${toolId}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            ✨ TextMagic Pro
          </Link>
          <nav className="nav">
            <Link href="/pricing" className="nav-link">가격</Link>
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

      <main>
        <section className="hero">
          <div className="container">
            <h1>AI로 텍스트를 마법처럼 변환하세요</h1>
            <p>요약, 번역, 재작성, 문법 검사 등 10가지 AI 도구로 콘텐츠 작업을 10배 빠르게</p>
            <Link href={user ? '/dashboard' : '/register'} className="btn btn-primary btn-large">
              {user ? '대시보드로 이동' : '무료로 시작하기'} →
            </Link>
          </div>
        </section>

        <section className="tools-section">
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>10가지 강력한 AI 도구</h2>
            <p style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
              무료로 하루 5회까지 사용 가능. Pro 플랜은 무제한!
            </p>
            <div className="tools-grid">
              {TOOLS.map((tool) => (
                <div
                  key={tool.id}
                  className="card tool-card"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <div className="tool-icon">{tool.icon}</div>
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-desc">{tool.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 0', background: 'var(--gray-100)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2>왜 TextMagic Pro인가요?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginTop: '40px' }}>
              <div className="card">
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚡</div>
                <h3>빠른 속도</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>몇 초 만에 결과를 받아보세요</p>
              </div>
              <div className="card">
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
                <h3>높은 정확도</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>최신 GPT-4 기반 AI 엔진</p>
              </div>
              <div className="card">
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>💰</div>
                <h3>합리적인 가격</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>월 $9부터 무제한 사용</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div>© 2025 TextMagic Pro. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/pricing">가격</Link>
            <a href="mailto:support@textmagic.pro">지원</a>
          </div>
        </div>
      </footer>
    </>
  );
}
