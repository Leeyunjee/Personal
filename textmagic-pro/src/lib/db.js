import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'textmagic.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    usage_count INTEGER DEFAULT 0,
    usage_reset_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    tool_name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export function getUser(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser(email, hashedPassword, name = '') {
  const today = new Date().toISOString().split('T')[0];
  const stmt = db.prepare('INSERT INTO users (email, password, name, usage_reset_date) VALUES (?, ?, ?, ?)');
  return stmt.run(email, hashedPassword, name, today);
}

export function updateUserPlan(userId, plan, stripeCustomerId, stripeSubscriptionId) {
  const stmt = db.prepare('UPDATE users SET plan = ?, stripe_customer_id = ?, stripe_subscription_id = ? WHERE id = ?');
  return stmt.run(plan, stripeCustomerId, stripeSubscriptionId, userId);
}

export function incrementUsage(userId) {
  const user = getUserById(userId);
  const today = new Date().toISOString().split('T')[0];

  if (user.usage_reset_date !== today) {
    // Reset usage for new day
    db.prepare('UPDATE users SET usage_count = 1, usage_reset_date = ? WHERE id = ?').run(today, userId);
  } else {
    db.prepare('UPDATE users SET usage_count = usage_count + 1 WHERE id = ?').run(userId);
  }
}

export function getUserUsage(userId) {
  const user = getUserById(userId);
  const today = new Date().toISOString().split('T')[0];

  if (user.usage_reset_date !== today) {
    return 0;
  }
  return user.usage_count || 0;
}

export function logUsage(userId, toolName) {
  const stmt = db.prepare('INSERT INTO usage_logs (user_id, tool_name) VALUES (?, ?)');
  return stmt.run(userId, toolName);
}

export function getUsageStats(userId) {
  return db.prepare(`
    SELECT tool_name, COUNT(*) as count
    FROM usage_logs
    WHERE user_id = ?
    GROUP BY tool_name
  `).all(userId);
}

export default db;
