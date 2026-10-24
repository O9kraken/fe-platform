import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("Нет переменной DATABASE_URL. Возьми строку подключения в Neon и добавь её в .env или в настройки Render.");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon требует SSL. В строке подключения от Neon уже есть sslmode=require.
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
});

export const q = (text, params) => pool.query(text, params);

/* Схема создаётся при каждом старте, если её ещё нет. Отдельный инструмент миграций не нужен. */
export async function migrate() {
  await q(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      TEXT NOT NULL,
      display_name  TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      disabled      BOOLEAN NOT NULL DEFAULT FALSE,
      token_version INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen_at  TIMESTAMPTZ
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower ON users (lower(username));

    CREATE TABLE IF NOT EXISTS docs (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      data       JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, name)
    );

    CREATE TABLE IF NOT EXISTS ai_usage (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day     DATE NOT NULL,
      count   INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
  `);
}
