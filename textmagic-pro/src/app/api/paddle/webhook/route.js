import { NextResponse } from 'next/server';
import { updateUserPlan, getUser } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();

    console.log('Paddle webhook received:', body.event_type);

    // Paddle 이벤트 처리
    switch (body.event_type) {
      case 'subscription.created':
      case 'subscription.activated': {
        const { custom_data, status, items } = body.data;

        if (status === 'active' && custom_data?.user_email) {
          const user = getUser(custom_data.user_email);

          if (user) {
            // 가격 ID로 플랜 결정
            const priceId = items?.[0]?.price?.id;
            let plan = 'pro';

            if (priceId === process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID) {
              plan = 'business';
            }

            updateUserPlan(
              user.id,
              plan,
              body.data.customer_id,
              body.data.id // subscription_id
            );

            console.log(`User ${user.email} upgraded to ${plan}`);
          }
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.past_due': {
        const { custom_data } = body.data;

        if (custom_data?.user_email) {
          const user = getUser(custom_data.user_email);

          if (user) {
            updateUserPlan(user.id, 'free', null, null);
            console.log(`User ${user.email} downgraded to free`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${body.event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
