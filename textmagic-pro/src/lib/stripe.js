import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
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
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business',
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

export async function createCheckoutSession(userId, email, plan) {
  const planConfig = PLANS[plan];
  if (!planConfig) {
    throw new Error('Invalid plan');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: userId.toString(),
      plan
    },
    success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pricing?canceled=true`
  });

  return session;
}

export async function createPortalSession(customerId) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard`
  });

  return session;
}

export async function handleWebhook(body, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  return event;
}

export default stripe;
