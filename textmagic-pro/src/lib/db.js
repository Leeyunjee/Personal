import { sql } from '@vercel/postgres';

// 테이블 초기화 (첫 요청시 자동 실행)
let initialized = false;

export async function initDB() {
  if (initialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        plan TEXT DEFAULT 'free',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        usage_count INTEGER DEFAULT 0,
        usage_reset_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        tool_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    initialized = true;
    console.log('Database initialized');
  } catch (error) {
    // 테이블이 이미 존재하면 무시
    if (!error.message?.includes('already exists')) {
      console.error('DB init error:', error);
    }
    initialized = true;
  }
}

export async function getUser(email) {
  await initDB();
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0];
}

export async function getUserById(id) {
  await initDB();
  const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0];
}

export async function createUser(email, hashedPassword, name = '') {
  await initDB();
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await sql`
    INSERT INTO users (email, password, name, usage_reset_date)
    VALUES (${email}, ${hashedPassword}, ${name}, ${today})
    RETURNING id
  `;
  return { lastInsertRowid: rows[0].id };
}

export async function updateUserPlan(userId, plan, customerId, subscriptionId) {
  await initDB();
  await sql`
    UPDATE users
    SET plan = ${plan},
        stripe_customer_id = ${customerId},
        stripe_subscription_id = ${subscriptionId}
    WHERE id = ${userId}
  `;
}

export async function incrementUsage(userId) {
  await initDB();
  const user = await getUserById(userId);
  const today = new Date().toISOString().split('T')[0];

  if (user.usage_reset_date !== today) {
    await sql`UPDATE users SET usage_count = 1, usage_reset_date = ${today} WHERE id = ${userId}`;
  } else {
    await sql`UPDATE users SET usage_count = usage_count + 1 WHERE id = ${userId}`;
  }
}

export async function getUserUsage(userId) {
  await initDB();
  const user = await getUserById(userId);
  if (!user) return 0;

  const today = new Date().toISOString().split('T')[0];

  if (user.usage_reset_date !== today) {
    return 0;
  }
  return user.usage_count || 0;
}

export async function logUsage(userId, toolName) {
  await initDB();
  await sql`INSERT INTO usage_logs (user_id, tool_name) VALUES (${userId}, ${toolName})`;
}

export async function getUsageStats(userId) {
  await initDB();
  const { rows } = await sql`
    SELECT tool_name, COUNT(*) as count
    FROM usage_logs
    WHERE user_id = ${userId}
    GROUP BY tool_name
  `;
  return rows;
}
