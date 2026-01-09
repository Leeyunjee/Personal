import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getUser, getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'textmagic-super-secret-key-change-in-production';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = getUserById(payload.userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    usageCount: user.usage_count,
    usageResetDate: user.usage_reset_date
  };
}

export function getUserFromToken(token) {
  const payload = verifyToken(token);
  if (!payload) return null;
  return getUserById(payload.userId);
}

export const PLAN_LIMITS = {
  free: 5,      // 5 uses per day
  pro: 500,     // 500 uses per day
  business: 2000 // 2000 uses per day
};

export function canUseService(user) {
  const limit = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  const today = new Date().toISOString().split('T')[0];

  if (user.usageResetDate !== today) {
    return true; // New day, can use
  }

  return (user.usageCount || 0) < limit;
}
