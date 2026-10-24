import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { q, migrate } from "./db.js";
import {
  USERNAME_RE, isReserved, hashPassword, checkPassword, publicUser, setSession, clearSession,
  requireUser, requireAdmin, seedAdmin, loginLimited, loginFailed, loginOk
} from "./auth.js";
import { aiHandler, aiEnabled } from "./ai.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.PORT || 3000;
const REG_OPEN = (process.env.ALLOW_REGISTRATION ?? "true") !== "false";
const DOC_RE = /^[a-z0-9_-]{1,40}$/;

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});
/* Изменяющие запросы принимаем только как JSON: простая защита от CSRF вместе с SameSite-cookie. */
app.use("/api", (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !req.is("application/json"))
    return res.status(415).json({ error: "Ожидается JSON" });
  next();
});

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get("/healthz", wrap(async (req, res) => { await q("SELECT 1"); res.json({ ok: true }); }));

/* ---------- аккаунт ---------- */
app.get("/api/config", (req, res) => res.json({ registration: REG_OPEN, ai: aiEnabled() }));

app.post("/api/auth/register", wrap(async (req, res) => {
  if (!REG_OPEN) return res.status(403).json({ error: "Регистрация закрыта. Попроси доступ у администратора." });
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  const displayName = String(req.body?.displayName || "").trim().slice(0, 60);
  if (!USERNAME_RE.test(username)) return res.status(400).json({ error: "Логин: 3–32 символа, латинские буквы, цифры, точка, дефис или подчёркивание." });
  if (isReserved(username)) return res.status(400).json({ error: "Этот логин занят." });
  if (password.length < 8) return res.status(400).json({ error: "Пароль должен быть не короче 8 символов." });
  try {
    const { rows } = await q(
      "INSERT INTO users (username, display_name, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, displayName || username, await hashPassword(password)]);
    setSession(res, rows[0]);
    res.status(201).json({ user: publicUser(rows[0]) });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Этот логин занят." });
    throw e;
  }
}));

app.post("/api/auth/login", wrap(async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  const key = req.ip + "|" + username.toLowerCase();
  if (loginLimited(key)) return res.status(429).json({ error: "Слишком много попыток. Подожди 15 минут." });
  const { rows } = await q("SELECT * FROM users WHERE lower(username) = lower($1)", [username]);
  const u = rows[0];
  if (!u || !(await checkPassword(password, u.password_hash))) { loginFailed(key); return res.status(401).json({ error: "Неверный логин или пароль." }); }
  if (u.disabled) return res.status(403).json({ error: "Аккаунт заблокирован." });
  loginOk(key);
  setSession(res, u);
  q("UPDATE users SET last_seen_at = now() WHERE id = $1", [u.id]).catch(() => {});
  res.json({ user: publicUser(u) });
}));

app.post("/api/auth/logout", (req, res) => { clearSession(res); res.json({ ok: true }); });

app.get("/api/me", requireUser, (req, res) => res.json({ user: publicUser(req.user), ai: aiEnabled() }));

app.patch("/api/me", requireUser, wrap(async (req, res) => {
  const displayName = String(req.body?.displayName || "").trim().slice(0, 60);
  if (!displayName) return res.status(400).json({ error: "Имя не может быть пустым." });
  const { rows } = await q("UPDATE users SET display_name = $1 WHERE id = $2 RETURNING *", [displayName, req.user.id]);
  res.json({ user: publicUser(rows[0]) });
}));

app.post("/api/me/password", requireUser, wrap(async (req, res) => {
  const { oldPassword = "", newPassword = "" } = req.body || {};
  if (!(await checkPassword(String(oldPassword), req.user.password_hash))) return res.status(400).json({ error: "Текущий пароль неверный." });
  if (String(newPassword).length < 8) return res.status(400).json({ error: "Новый пароль должен быть не короче 8 символов." });
  const { rows } = await q("UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2 RETURNING *",
    [await hashPassword(String(newPassword)), req.user.id]);
  setSession(res, rows[0]); // остальные устройства выйдут, это — останется в системе
  res.json({ ok: true });
}));

/* ---------- прогресс: документы пользователя ---------- */
app.get("/api/docs", requireUser, wrap(async (req, res) => {
  const { rows } = await q("SELECT name, data FROM docs WHERE user_id = $1", [req.user.id]);
  res.json(Object.fromEntries(rows.map(r => [r.name, r.data])));
}));

app.get("/api/docs/:name", requireUser, wrap(async (req, res) => {
  if (!DOC_RE.test(req.params.name)) return res.status(400).json({ error: "Неверное имя" });
  const { rows } = await q("SELECT data FROM docs WHERE user_id = $1 AND name = $2", [req.user.id, req.params.name]);
  if (!rows[0]) return res.status(404).json({ error: "Нет данных" });
  res.json(rows[0].data);
}));

app.put("/api/docs/:name", requireUser, wrap(async (req, res) => {
  if (!DOC_RE.test(req.params.name)) return res.status(400).json({ error: "Неверное имя" });
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "Ожидается объект" });
  await q(`INSERT INTO docs (user_id, name, data, updated_at) VALUES ($1, $2, $3, now())
           ON CONFLICT (user_id, name) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [req.user.id, req.params.name, req.body]);
  res.json({ ok: true });
}));

/* ---------- наставник ---------- */
app.post("/api/ai", requireUser, wrap(aiHandler));

/* ---------- админка ---------- */
app.get("/api/admin/users", requireUser, requireAdmin, wrap(async (req, res) => {
  const { rows } = await q(`
    SELECT u.id, u.username, u.display_name, u.role, u.disabled, u.created_at, u.last_seen_at,
           c.data AS course, c.updated_at AS progress_at,
           COALESCE((SELECT sum(count) FROM ai_usage a WHERE a.user_id = u.id AND a.day > CURRENT_DATE - 7), 0)::int AS ai_week
    FROM users u LEFT JOIN docs c ON c.user_id = u.id AND c.name = 'course'
    ORDER BY (u.role = 'admin') DESC, u.last_seen_at DESC NULLS LAST, u.id`);
  res.json(rows.map(r => ({
    id: r.id, username: r.username, displayName: r.display_name, role: r.role, disabled: r.disabled,
    createdAt: r.created_at, lastSeenAt: r.last_seen_at, progressAt: r.progress_at, aiWeek: r.ai_week,
    course: r.course ? { c: r.course.c || {}, q: r.course.q || {}, ex: r.course.ex || {}, days: r.course.days || {}, j: r.course.j || {} } : null
  })));
}));

app.patch("/api/admin/users/:id", requireUser, requireAdmin, wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id && (req.body.role === "student" || req.body.disabled === true))
    return res.status(400).json({ error: "Нельзя снять права или заблокировать самого себя." });
  const sets = [], vals = [];
  if (req.body.role === "admin" || req.body.role === "student") { vals.push(req.body.role); sets.push(`role = $${vals.length}`); }
  if (typeof req.body.disabled === "boolean") { vals.push(req.body.disabled); sets.push(`disabled = $${vals.length}`); sets.push("token_version = token_version + 1"); }
  let tempPassword = null;
  if (req.body.resetPassword) {
    tempPassword = Math.random().toString(36).slice(2, 8) + "-" + Math.random().toString(36).slice(2, 8);
    vals.push(await hashPassword(tempPassword)); sets.push(`password_hash = $${vals.length}`); sets.push("token_version = token_version + 1");
  }
  if (!sets.length) return res.status(400).json({ error: "Нечего менять" });
  vals.push(id);
  const { rows } = await q(`UPDATE users SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`, vals);
  if (!rows[0]) return res.status(404).json({ error: "Пользователь не найден" });
  res.json({ user: publicUser(rows[0]), disabled: rows[0].disabled, tempPassword });
}));

app.delete("/api/admin/users/:id", requireUser, requireAdmin, wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: "Нельзя удалить самого себя." });
  await q("DELETE FROM users WHERE id = $1", [id]);
  res.json({ ok: true });
}));

app.get("/api/admin/users/:id/docs/:name", requireUser, requireAdmin, wrap(async (req, res) => {
  if (!DOC_RE.test(req.params.name)) return res.status(400).json({ error: "Неверное имя" });
  const { rows } = await q("SELECT data FROM docs WHERE user_id = $1 AND name = $2", [Number(req.params.id), req.params.name]);
  res.json(rows[0]?.data || {});
}));

/* ---------- статика ---------- */
const vendor = (url, dir) => app.use(url, express.static(path.join(ROOT, "node_modules", dir), { maxAge: "30d", immutable: true }));
vendor("/vendor/codemirror", "codemirror");
vendor("/vendor/babel", "@babel/standalone");
vendor("/vendor/react", "react/umd");
vendor("/vendor/react-dom", "react-dom/umd");
app.use(express.static(path.join(ROOT, "public"), { extensions: ["html"], maxAge: "5m" }));

app.use("/api", (req, res) => res.status(404).json({ error: "Нет такого адреса" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Слишком большой объём данных" });
  res.status(500).json({ error: "Ошибка сервера. Попробуй ещё раз." });
});

await migrate();
await seedAdmin();
app.listen(PORT, () => console.log(`Платформа запущена: http://localhost:${PORT}`));
