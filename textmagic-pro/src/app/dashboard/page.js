'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const TOOLS = [
  { id: 'summarize', name: '텍스트 요약', icon: '📝' },
  { id: 'grammar', name: '문법 검사', icon: '✓' },
  { id: 'email', name: '이메일 작성', icon: '✉️' },
  { id: 'social', name: '소셜 미디어', icon: '📱' },
  { id: 'seo', name: 'SEO 메타 태그', icon: '🔍' },
  { id: 'headline', name: '제목 생성', icon: '🎯' },
  { id: 'translate', name: '번역', icon: '🌐' },
  { id: 'rewrite', name: '리라이터', icon: '🔄' },
  { id: 'expand', name: '텍스트 확장', icon: '📈' },
  { id: 'simplify', name: '간단하게 설명', icon: '💡' },
];

const PLAN_LIMITS = {
  free: 5,
  pro: 500,
  business: 2000
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState('summarize');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tool = searchParams.get('tool');
    if (tool && TOOLS.find(t => t.id === tool)) {
      setSelectedTool(tool);
    }
  }, [searchParams]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('텍스트를 입력해주세요');
      return;
    }

    setError('');
    setProcessing(true);
    setResult('');

    try {
      const res = await fetch('/api/tools/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedTool,
          text: inputText,
          options: {}
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          setError('오늘의 사용 한도에 도달했습니다. Pro 플랜으로 업그레이드하세요!');
        } else {
          setError(data.error || '처리 중 오류가 발생했습니다');
        }
        return;
      }

      setResult(data.result);
      setUser(prev => ({
        ...prev,
        usageCount: data.usage.used
      }));

    } catch (error) {
      setError('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  if (!user) return null;

  const usagePercent = Math.min(100, (user.usageCount / PLAN_LIMITS[user.plan]) * 100);
  const currentTool = TOOLS.find(t => t.id === selectedTool);

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            ✨ TextMagic Pro
          </Link>
          <nav className="nav">
            <span style={{ color: 'var(--gray-500)' }}>{user.email}</span>
            <span className={`plan-badge ${user.plan}`}>{user.plan}</span>
            {user.plan === 'free' && (
              <Link href="/pricing" className="btn btn-primary">
                업그레이드
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1>대시보드</h1>
              <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>
                AI 도구를 사용하여 텍스트를 변환하세요
              </p>
            </div>
            <div className="card" style={{ minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>오늘 사용량</span>
                <span style={{ fontWeight: '600' }}>
                  {user.usageCount} / {PLAN_LIMITS[user.plan]}
                </span>
              </div>
              <div className="usage-bar">
                <div className="usage-fill" style={{ width: `${usagePercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="tool-tabs">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                className={`tool-tab ${selectedTool === tool.id ? 'active' : ''}`}
                onClick={() => setSelectedTool(tool.id)}
              >
                {tool.icon} {tool.name}
              </button>
            ))}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '24px' }}>
              {currentTool?.icon} {currentTool?.name}
            </h2>

            <div className="tool-workspace">
              <div>
                <label className="label">입력 텍스트</label>
                <textarea
                  className="input textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="변환할 텍스트를 입력하세요..."
                  rows={10}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleProcess}
                  disabled={processing}
                  style={{ marginTop: '16px', width: '100%' }}
                >
                  {processing ? (
                    <>
                      <span className="loading"></span> 처리 중...
                    </>
                  ) : (
                    '변환하기 ✨'
                  )}
                </button>
                {error && <p className="error-message">{error}</p>}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="label">결과</label>
                  {result && (
                    <button
                      className="btn btn-secondary"
                      onClick={copyToClipboard}
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      복사하기
                    </button>
                  )}
                </div>
                <div className="result-box" style={{ minHeight: '280px' }}>
                  {processing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-400)' }}>
                      <span className="loading"></span> AI가 처리 중입니다...
                    </div>
                  ) : result ? (
                    result
                  ) : (
                    <span style={{ color: 'var(--gray-400)' }}>
                      결과가 여기에 표시됩니다
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
