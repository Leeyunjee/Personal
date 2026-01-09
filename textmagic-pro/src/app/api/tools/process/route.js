import { NextResponse } from 'next/server';
import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
import { incrementUsage, getUserUsage, logUsage } from '@/lib/db';
import { processText, processTextDemo, TOOLS } from '@/lib/ai';

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { toolId, text, options } = await request.json();

    if (!toolId || !text) {
      return NextResponse.json(
        { error: '도구와 텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    if (!TOOLS[toolId]) {
      return NextResponse.json(
        { error: '유효하지 않은 도구입니다' },
        { status: 400 }
      );
    }

    // Check usage limit
    const currentUsage = getUserUsage(user.id);
    const limit = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

    if (currentUsage >= limit) {
      return NextResponse.json(
        {
          error: '오늘의 사용 한도에 도달했습니다. Pro 플랜으로 업그레이드하세요!',
          limitReached: true
        },
        { status: 429 }
      );
    }

    // Process text
    let result;
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    if (hasApiKey) {
      result = await processText(toolId, text, options);
    } else {
      // Use demo mode if no API key
      result = await processTextDemo(toolId, text, options);
    }

    // Log usage
    incrementUsage(user.id);
    logUsage(user.id, toolId);

    return NextResponse.json({
      success: true,
      result,
      usage: {
        used: currentUsage + 1,
        limit,
        plan: user.plan
      }
    });

  } catch (error) {
    console.error('Tool processing error:', error);
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
