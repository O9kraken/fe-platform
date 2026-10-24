import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { q } from "./db.js";

const COOKIE = "fe_session";
const SECRET = process.env.JWT_SECRET;
const PROD = process.env.NODE_ENV === "production";
const ADMIN_NAME = (process.env.ADMIN_USERNAME || "KRAKER").trim();

if (!SECRET || SECRET.length < 24) {
  console.error("JWT_SECRET не задан или короче 24 символов. На Render он создаётся автоматически, локально впиши любую длинную случайную строку в .env.");
  process.exit(1);
}

export const USERNAME_RE = /^[A-Za-z0-9_.-]{3,32}$/;
export const isReserved = name => name.toLowerCase() === ADMIN_NAME.toLowerCase();

export const hashPassword = pw => bcrypt.hash(pw, 11);
export const checkPassword = (pw, hash) => bcrypt.compare(pw, hash);

export function publicUser(u) {
  return { id: u.id, username: u.username, displayName: u.display_name || u.username, role: u.role, createdAt: u.created_at };
}

export function setSession(res, user) {
  const token = jwt.sign({ uid: user.id, tv: user.token_version }, SECRET, { expiresIn: "30d" });
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: PROD, maxAge: 30 * 24 * 3600 * 1000, path: "/" });
}
export function clearSession(res) {
  res.clearCookie(COOKIE, { path: "/" });
}

/* Проверяет cookie и кладёт пользователя в req.user. Заблокированные и вышедшие сессии отклоняются. */
export async function requireUser(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE];
    if (!token) return res.status(401).json({ error: "Нужно войти" });
    const p = jwt.verify(token, SECRET);
    const { rows } = await q("SELECT * FROM users WHERE id = $1", [p.uid]);
    const u = rows[0];
    if (!u || u.token_version !== p.tv) { clearSession(res); return res.status(401).json({ error: "Сессия устарела, войди снова" }); }
    if (u.disabled) { clearSession(res); return res.status(403).json({ error: "Аккаунт заблокирован" }); }
    req.user = u;
    // отмечаем активность не чаще раза в 5 минут
    if (!u.last_seen_at || Date.now() - new Date(u.last_seen_at).getTime() > 5 * 60 * 1000)
      q("UPDATE users SET last_seen_at = now() WHERE id = $1", [u.id]).catch(() => {});
    next();
  } catch {
    clearSession(res);
    res.status(401).json({ error: "Нужно войти" });
  }
}
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Только для администратора" });
  next();
}

/* Создаёт администратора KRAKER при первом запуске, если задан ADMIN_PASSWORD. */
export async function seedAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  const { rows } = await q("SELECT id, role FROM users WHERE lower(username) = lower($1)", [ADMIN_NAME]);
  if (rows[0]) {
    if (rows[0].role !== "admin") await q("UPDATE users SET role = 'admin' WHERE id = $1", [rows[0].id]);
    return;
  }
  if (!pw || pw.length < 8) {
    console.warn(`Админ ${ADMIN_NAME} ещё не создан: задай ADMIN_PASSWORD (минимум 8 символов) и перезапусти сервер.`);
    return;
  }
  await q("INSERT INTO users (username, display_name, password_hash, role) VALUES ($1, $1, $2, 'admin')", [ADMIN_NAME, await hashPassword(pw)]);
  console.log(`Создан администратор ${ADMIN_NAME}.`);
}

/* Простая защита от перебора паролей: 10 неудачных попыток за 15 минут с одного IP + логина. */
const fails = new Map();
export function loginLimited(key) {
  const now = Date.now(), f = fails.get(key);
  if (f && now - f.first > 15 * 60 * 1000) { fails.delete(key); return false; }
  return !!f && f.count >= 10;
}
export function loginFailed(key) {
  const f = fails.get(key);
  if (f) f.count++; else fails.set(key, { count: 1, first: Date.now() });
}
export const loginOk = key => fails.delete(key);
