import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCheckoutSession, PLANS } from '@/lib/stripe';

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (!PLANS[plan]) {
      return NextResponse.json(
        { error: '유효하지 않은 플랜입니다' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(user.id, user.email, plan);

    return NextResponse.json({
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: '결제 세션 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
