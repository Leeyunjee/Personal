import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserUsage } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const usage = getUserUsage(user.id);

    return NextResponse.json({
      user: {
        ...user,
        usageCount: usage
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}
